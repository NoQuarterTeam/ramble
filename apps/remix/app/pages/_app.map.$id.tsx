import { useLoaderData, useNavigate } from "@remix-run/react"
import { json, type LoaderArgs } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

import { CloseButton } from "@travel/ui"

import queryString from "query-string"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers"

export const headers = useLoaderHeaders

export const loader = async ({ params }: LoaderArgs) => {
  const spot = await db.spot.findUniqueOrThrow({ where: { id: params.id } })
  return json(spot, {
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

export default function SpotTile() {
  const spot = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  return (
    <div className="mt-nav absolute bottom-4 left-4 top-4 z-10 w-[400px] rounded-md bg-white p-4 shadow-md dark:bg-gray-900">
      <div>
        <div className="flex justify-between">
          <p className="text-lg">{spot.name}</p>
          <CloseButton
            onClick={() => {
              const params = queryString.stringify(queryString.parse(window.location.search))
              navigate(`..?${params}`)
            }}
          />
        </div>
        <p>{spot.address}</p>
      </div>
    </div>
  )
}
