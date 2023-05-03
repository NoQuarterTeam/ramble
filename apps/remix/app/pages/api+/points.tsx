import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

import { getMapPoints } from "~/services/points.server"

export const loader = async ({ request }: LoaderArgs) => {
  const spots = await getMapPoints(request)
  return json(spots, {
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

export const pointsLoader = loader
