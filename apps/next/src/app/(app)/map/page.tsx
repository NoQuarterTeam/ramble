import "mapbox-gl/dist/mapbox-gl.css"

import { cache } from "react"
import Supercluster from "supercluster"
import { z } from "zod"

import { type SpotType } from "@ramble/database/types"

import { db } from "~/lib/db"

import { MapView } from "./MapView"

export const revalidate = 60 * 60 * 24 // 24 hours

type MapSearchParams = {
  type?: string
  minLat?: string
  maxLat?: string
  minLng?: string
  maxLng?: string
}

const NumAsString = z.coerce.number()

const getSpots = cache(async (searchParams: MapSearchParams) => {
  const schema = z.object({
    zoom: NumAsString,
    minLat: NumAsString,
    maxLat: NumAsString,
    minLng: NumAsString,
    maxLng: NumAsString,
    type: z.string().nullish(),
  })
  const result = await schema.safeParseAsync(searchParams)

  if (!result.success) return []
  const { type, zoom, ...coords } = result.data
  const spots = await db.spot.findMany({
    select: { id: true, latitude: true, longitude: true, type: true },
    where: {
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
})

export type Point = Awaited<ReturnType<typeof getSpots>>[number]

export default async function Map({ searchParams }: { searchParams: MapSearchParams }) {
  const spots = await getSpots(searchParams)
  return <MapView points={spots} />
}
