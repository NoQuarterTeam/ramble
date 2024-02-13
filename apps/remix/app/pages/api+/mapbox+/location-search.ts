import { getPlaces } from "@ramble/server-services"
import { cacheHeader } from "pretty-cache-header"

import type { LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const search = url.searchParams.get("search")
  if (!search) return [] as { name: string; center: [number, number] }[]
  const places = await getPlaces({ search })
  return json(places, {
    headers: {
      "Cache-Control": cacheHeader({ public: true, maxAge: "1week", sMaxage: "1week" }),
    },
  })
}

export const locationSearchLoader = loader
