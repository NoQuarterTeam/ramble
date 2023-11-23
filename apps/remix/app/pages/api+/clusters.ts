import { cacheHeader } from "pretty-cache-header"
import queryString from "query-string"
import Supercluster from "supercluster"
import { z } from "zod"
import { CheckboxAsString, NumAsString } from "zodix"

import { publicSpotWhereClause } from "@ramble/api"
import { SpotType } from "@ramble/database/types"

import { db } from "~/lib/db.server"
import type { LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { getUserSession } from "~/services/session/session.server"

export const config = {
  // runtime: "edge",
  // regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

async function getMapClusters(request: Request) {
  const { userId } = await getUserSession(request)
  const schema = z.object({
    zoom: NumAsString,
    minLat: NumAsString,
    maxLat: NumAsString,
    minLng: NumAsString,
    maxLng: NumAsString,
    type: z.array(z.string()).or(z.string()).optional(),
    isPetFriendly: CheckboxAsString.optional(),
    isUnverified: CheckboxAsString.optional(),
  })
  const result = schema.safeParse(queryString.parse(new URL(request.url).search, { arrayFormat: "bracket" }))
  if (!result.success) return []
  const { zoom, type, isUnverified, isPetFriendly, ...coords } = result.data

  if (!type || type.length === 0) return []
  const spots = await db.spot.findMany({
    select: { id: true, latitude: true, longitude: true, type: true },
    where: {
      latitude: { gt: coords.minLat, lt: coords.maxLat },
      longitude: { gt: coords.minLng, lt: coords.maxLng },
      verifiedAt: isUnverified ? undefined : { not: { equals: null } },
      type: typeof type === "string" ? { equals: type as SpotType } : { in: type as SpotType[] },
      ...publicSpotWhereClause(userId),
      isPetFriendly: isPetFriendly ? { equals: true } : undefined,
    },
    orderBy: { verifiedAt: "desc" },
    take: 8000,
  })
  if (spots.length === 0) return []

  const supercluster = new Supercluster<{ id: string; type: SpotType; cluster: false }, { cluster: true }>({
    maxZoom: 16,
    radius: !type || typeof type === "string" ? 30 : type.length > 4 ? 60 : 40,
  })

  const clusterData = supercluster.load(
    spots.map((spot) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [spot.longitude, spot.latitude] },
      properties: { id: spot.id, type: spot.type, cluster: false },
    })),
  )

  const clusters = clusterData.getClusters([coords.minLng, coords.minLat, coords.maxLng, coords.maxLat], zoom || 5)

  return clusters.map((c) => ({
    ...c,
    properties: c.properties.cluster
      ? { ...c.properties, zoomLevel: supercluster.getClusterExpansionZoom(c.properties.cluster_id) }
      : c.properties,
  }))
}

export type SpotCluster = Awaited<ReturnType<typeof getMapClusters>>[number]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const spots = await getMapClusters(request)
  return json(spots, {
    headers: {
      "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min" }),
    },
  })
}

export const clustersLoader = loader
