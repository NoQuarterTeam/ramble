import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url)
  const startLng = url.searchParams.get("startLng")
  const startLat = url.searchParams.get("startLat")
  const endLng = url.searchParams.get("endLng")
  const endLat = url.searchParams.get("endLat")

  const res = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw`,
  )

  const jsonResponse = (await res.json()) as Directions

  const directions = jsonResponse

  return json(directions || "Unknown address", {
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
