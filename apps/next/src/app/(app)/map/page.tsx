import { cache } from "react"
import Supercluster from "supercluster"
import { db } from "~/lib/db"
import { MapView } from "./MapView"

const getSpots = cache(async () => {
  const spots = await db.spot.findMany({
    // take: 20, // temp limit
    select: { id: true, latitude: true, longitude: true, type: true },
    where: {
      // latitude: { gt: coords.minLat, lt: coords.maxLat },
      // longitude: { gt: coords.minLng, lt: coords.maxLng },
      // type: type ? { equals: type as SpotType } : undefined,
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
  return clusters.getClusters([-10, 40, 50, 10], 5)
})

export type Point = Awaited<ReturnType<typeof getSpots>>[number]

export default async function Map() {
  const spots = await getSpots()
  return <MapView points={spots} />
}
