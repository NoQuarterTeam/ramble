import { cacheHeader } from "pretty-cache-header"
import queryString from "query-string"
import Supercluster from "supercluster"
import { z } from "zod"
import { NumAsString } from "zodix"

import { type User } from "@ramble/database/types"

import { db } from "~/lib/db.server"
import type { LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { requireUser } from "~/services/auth/auth.server"

export const config = {
  // runtime: "edge",
  // regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

async function getUserClusters(request: Request) {
  await requireUser(request)
  const schema = z.object({
    zoom: NumAsString,
    minLat: NumAsString,
    maxLat: NumAsString,
    minLng: NumAsString,
    maxLng: NumAsString,
  })
  const result = schema.safeParse(queryString.parse(new URL(request.url).search, { arrayFormat: "bracket" }))
  if (!result.success) return []
  const coords = result.data

  const users = await db.user.findMany({
    select: { id: true, latitude: true, longitude: true, avatar: true, avatarBlurHash: true, username: true },
    where: {
      latitude: { not: null, gt: coords.minLat, lt: coords.maxLat },
      longitude: { not: null, gt: coords.minLng, lt: coords.maxLng },
      isLocationPrivate: false,
    },
    take: 8000,
  })
  if (users.length === 0) return []

  const supercluster = new Supercluster<
    { cluster: false } & Pick<User, "id" | "avatar" | "avatarBlurHash" | "username">,
    { cluster: true }
  >({
    maxZoom: 16,
    radius: 50,
  })

  const clusterData = supercluster.load(
    users.map((user) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [user.longitude!, user.latitude!] },
      properties: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        avatarBlurHash: user.avatarBlurHash,
        cluster: false,
      },
    })),
  )

  const clusters = clusterData.getClusters([coords.minLng, coords.minLat, coords.maxLng, coords.maxLat], coords.zoom || 5)

  return clusters.map((c) => ({
    ...c,
    properties: c.properties.cluster
      ? { ...c.properties, zoomLevel: supercluster.getClusterExpansionZoom(c.properties.cluster_id) }
      : c.properties,
  }))
}

export type UserCluster = Awaited<ReturnType<typeof getUserClusters>>[number]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const spots = await getUserClusters(request)
  return json(spots, {
    headers: {
      "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min" }),
    },
  })
}

export const userClustersLoader = loader
