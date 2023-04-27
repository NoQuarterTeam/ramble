import { json, type LoaderArgs } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import SuperCluster from "supercluster"
import { z } from "zod"

import { SpotType } from "@travel/database"

import { db } from "~/lib/db.server"

export const loader = async ({ request }: LoaderArgs) => {
  return json(await getMapSpots(request), {
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

export async function getMapSpots(request: Request) {
  const url = new URL(request.url)
  const paramType = url.searchParams.get("type")
  const zoomType = url.searchParams.get("zoom")
  let type
  if (paramType) {
    type = await z.nativeEnum(SpotType).nullable().optional().parseAsync(url.searchParams.get("type"))
  }

  const zoom = (await z.coerce.number().parseAsync(zoomType)) || 5

  const coords = await z
    .object({ minLat: z.coerce.number(), maxLat: z.coerce.number(), minLng: z.coerce.number(), maxLng: z.coerce.number() })
    .parseAsync({
      minLat: url.searchParams.get("minLat") || 45,
      maxLat: url.searchParams.get("maxLat") || 55,
      minLng: url.searchParams.get("minLng") || -4,
      maxLng: url.searchParams.get("maxLng") || 4,
    })

  const spots = await db.spot.findMany({
    take: 20, // temp limit
    select: { id: true, latitude: true, longitude: true, type: true },
    where: {
      latitude: { gt: coords.minLat, lt: coords.maxLat },
      longitude: { gt: coords.minLng, lt: coords.maxLng },
      type: type ? { equals: type } : undefined,
    },
    orderBy: { createdAt: "desc" },
  })

  const superCluster = new SuperCluster()
  if (spots.length === 0) return []

  const clusters = superCluster.load(
    spots.map((spot) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [spot.longitude, spot.latitude] },
      properties: { id: spot.id, type: spot.type },
    })),
  )
  return clusters.getClusters([coords.minLng, coords.minLat, coords.maxLng, coords.maxLat], zoom)
}
