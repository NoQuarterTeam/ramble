import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

import Supercluster from "supercluster"
import { z } from "zod"
import { CheckboxAsString, NumAsString, parseQuerySafe } from "zodix"

import type { SpotType } from "@travel/database"

import { db } from "~/lib/db.server"

async function getMapPoints(request: Request) {
  const result = parseQuerySafe(request, {
    zoom: NumAsString,
    minLat: NumAsString,
    maxLat: NumAsString,
    minLng: NumAsString,
    maxLng: NumAsString,
    type: z.string().optional().nullable(),
    isPetFriendly: CheckboxAsString,
  })
  if (!result.success) return []

  const { type, zoom, isPetFriendly, ...coords } = result.data
  const spots = await db.spot.findMany({
    // take: 20, // temp limit
    select: { id: true, latitude: true, longitude: true, type: true },
    where: {
      isPetFriendly: isPetFriendly ? { equals: true } : undefined,
      latitude: { gt: coords.minLat, lt: coords.maxLat },
      longitude: { gt: coords.minLng, lt: coords.maxLng },
      type: type ? { equals: type as SpotType } : undefined,
    },
    orderBy: { createdAt: "desc" },
  })
  if (spots.length === 0) return []

  const supercluster = new Supercluster()

  const clusters = supercluster.load(
    spots.map((spot) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [spot.longitude, spot.latitude] },
      properties: { id: spot.id, type: spot.type },
    })),
  )
  return clusters.getClusters([coords.minLng, coords.minLat, coords.maxLng, coords.maxLat], zoom || 5)
}

export type Point = Awaited<ReturnType<typeof getMapPoints>>[number]

export const loader = async ({ request }: LoaderArgs) => {
  const spots = await getMapPoints(request)
  return json(spots, {
    headers: {
      "Cache-Control": cacheHeader({
        public: true,
        maxAge: "1hour",
        sMaxage: "1hour",
        staleWhileRevalidate: "1day",
        staleIfError: "1day",
      }),
    },
  })
}

export const pointsLoader = loader
