import { cacheHeader } from "pretty-cache-header"

import { db } from "~/lib/db.server"
import { badRequest } from "~/lib/remix.server"
import { booleanWithin, buffer, lineString, point } from "~/lib/vendor/turf.server"
import type { LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"

// export const config = {
// // runtime: "edge",
// }

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const startLng = url.searchParams.get("startLng")
  const startLat = url.searchParams.get("startLat")
  const endLng = url.searchParams.get("endLng")
  const endLat = url.searchParams.get("endLat")

  const res = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw`,
  )

  const jsonResponse = (await res.json()) as Directions
  if (!jsonResponse.routes[0]) throw badRequest("Unknown address")
  const linestring = lineString(jsonResponse.routes[0].geometry.coordinates)
  const buffered = buffer(linestring, 35, { units: "kilometers" })
  const spots = await db.spot.findMany({ select: { id: true, latitude: true, longitude: true } })

  const spotsWithinBuffer = spots.filter((spot) => {
    const pointFrom = point([spot.longitude, spot.latitude])
    return booleanWithin(pointFrom, buffered)
  })

  const foundSpots = await db.spot.findMany({ take: 2000, where: { id: { in: spotsWithinBuffer.map((spot) => spot.id) } } })

  const directions = jsonResponse

  return json({ directions, foundSpots } || "Unknown address", {
    headers: {
      "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min" }),
    },
  })
}

export const directionsLoader = loader

export interface Directions {
  routes: Route[]
}

export type Route = {
  distance: number
  duration: number
  geometry: { coordinates: [number, number][]; type: "LineString" }
  // legs: [Object]
  weight: number
}
