import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import { geocodeCoords } from "@ramble/api"

export const config = {
  runtime: "edge",
}

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url)
  const latitude = url.searchParams.get("latitude")
  const longitude = url.searchParams.get("longitude")
  const address = await geocodeCoords({ latitude: Number(latitude), longitude: Number(longitude) })

  return json(address || "Unknown address", {
    headers: {
      "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour" }),
    },
  })
}

export const geocodeLoader = loader
