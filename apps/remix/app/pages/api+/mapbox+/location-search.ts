import { cacheHeader } from "pretty-cache-header"

import type { LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"

// import { requireUser } from "~/services/auth/auth.server"

// export const config = {
// // runtime: "edge",
// }

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const search = url.searchParams.get("search")

  // const userId = await requireUser(request)
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json?access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw`,
  )

  const jsonResponse = (await res.json()) as FeatureCollection

  const places = jsonResponse.features.map((place) => ({
    name: place.place_name,
    center: place.center,
  }))
  return json(places || "Unknown address", {
    headers: {
      "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min" }),
    },
  })
}

export const locationSearchLoader = loader

type FeatureCollection = {
  type: "FeatureCollection"
  query: string[]
  features: Feature[]
}

type Feature = {
  id: string
  type: "Feature"
  place_type: string[]
  relevance: number
  text: string
  place_name: string
  bbox: number[]
  center: [number, number]
  context: Context[]
  matching_text?: string
  matching_place_name?: string
}

type Context = {
  id: string
  text: string
  wikidata?: string
  short_code?: string
  language?: string
  text_en?: string
}
