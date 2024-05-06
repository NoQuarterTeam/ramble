import * as Sentry from "@sentry/nextjs"
export async function getDirections(coords: [number, number][]) {
  try {
    const coordsString = coords.map((coord) => coord.join(",")).join(";")

    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw`,
    )

    const jsonResponse = (await res.json()) as Directions
    return jsonResponse
  } catch (error) {
    Sentry.captureException(error)
    return null
  }
}

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
