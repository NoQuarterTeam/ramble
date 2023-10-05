import type { LoaderFunctionArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import queryString from "query-string"
import Supercluster from "supercluster"
import { z } from "zod"
import { CheckboxAsString, NumAsString } from "zodix"

import { publicSpotWhereClause } from "@ramble/api"
import { SpotType } from "@ramble/database/types"

import { db } from "~/lib/db.server"
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
    isVerified: CheckboxAsString.optional(),
  })
  const result = schema.safeParse(queryString.parse(new URL(request.url).search, { arrayFormat: "bracket" }))
  if (!result.success) return []
  const { zoom, type, isVerified, isPetFriendly, ...coords } = result.data

  const defaultTypes = [SpotType.CAMPING, SpotType.FREE_CAMPING]
  const spots = await db.spot.findMany({
    select: { id: true, latitude: true, longitude: true, type: true },
    where: {
      ...publicSpotWhereClause(userId),
      verifiedAt: isVerified ? { not: { equals: null } } : undefined,
      isPetFriendly: isPetFriendly ? { equals: true } : undefined,
      latitude: { gt: coords.minLat, lt: coords.maxLat },
      longitude: { gt: coords.minLng, lt: coords.maxLng },
      type: type
        ? typeof type === "string"
          ? { equals: type as SpotType }
          : type.length > 0
          ? { in: type as SpotType[] }
          : { in: defaultTypes }
        : { in: defaultTypes },
    },
    orderBy: { createdAt: "desc" },
    take: 2000,
  })
  if (spots.length === 0) return []

  const supercluster = new Supercluster<{ id: string; type: SpotType; cluster: false }, { cluster: true }>()

  const clusters = supercluster.load(
    spots.map((spot) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [spot.longitude, spot.latitude] },
      properties: { id: spot.id, type: spot.type, cluster: false },
    })),
  )

  return clusters.getClusters([coords.minLng, coords.minLat, coords.maxLng, coords.maxLat], zoom || 5)
}

export type Cluster = Awaited<ReturnType<typeof getMapClusters>>[number]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const spots = await getMapClusters(request)
  return json(spots, {
    headers: {
      "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min" }),
    },
  })
}

export const clustersLoader = loader
