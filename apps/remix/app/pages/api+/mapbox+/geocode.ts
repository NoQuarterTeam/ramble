import type { LoaderFunctionArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

// export const config = {
// // runtime: "edge",
// }

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const latitude = url.searchParams.get("latitude")
  const longitude = url.searchParams.get("longitude")
  const address = await geocodeCoords({ latitude: Number(latitude), longitude: Number(longitude) })

  return json(address || "Unknown address", {
    headers: {
      "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min" }),
    },
  })
}

export const geocodeLoader = loader

export async function geocodeCoords({ latitude, longitude }: { latitude: number; longitude: number }) {
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw`,
  )

  const jsonResponse = (await res.json()) as FeatureCollection

  const address = jsonResponse.features.find((feature) => feature.place_type.includes("address"))?.place_name

  return address
}

type Context = {
  id: string
  mapbox_id?: string
  wikidata?: string
  short_code?: string
  text: string
}[]

type Geometry = {
  type: string
  coordinates: [number, number]
}

type Properties = {
  accuracy?: string
  mapbox_id?: string
  wikidata?: string
}

type Feature = {
  id: string
  type: string
  place_type: string[]
  relevance: number
  properties?: Properties
  text: string
  place_name: string
  bbox?: [number, number, number, number]
  center: [number, number]
  geometry: Geometry
  context: Context
}

type FeatureCollection = {
  type: string
  query: [number, number]
  features: Feature[]
  attribution: string
}
