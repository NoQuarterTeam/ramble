import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import { requireUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url)
  const search = url.searchParams.get("search")

  const userId = await requireUser(request)
  const res = await fetch(
    `https://api.mapbox.com/search/searchbox/v1/suggest?q=${search}&access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw&session_token=${userId}&types=place,city,country`,
  )

  const jsonResponse = (await res.json()) as Data

  const suggestions = jsonResponse.suggestions.map((suggestion) => ({
    name: suggestion.name,
    label: suggestion.place_formatted,
  }))
  return json(suggestions || "Unknown address", {
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

export const locationSearchLoader = loader

type Suggestion = {
  name: string
  name_preferred: string
  mapbox_id: string
  feature_type: string
  address: string
  full_address: string
  place_formatted: string
  context: {
    country: {
      name: string
      country_code: string
      country_code_alpha_3: string
    }
    postcode: {
      name: string
    }
    place: {
      name: string
    }
    street: {
      name: string
    }
  }
  language: string
  maki: string
  poi_category: string[]
  poi_category_ids: string[]
  external_ids: Record<string, unknown>
  metadata: Record<string, unknown>
}

interface Data {
  suggestions: Suggestion[]
}
