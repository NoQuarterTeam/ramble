import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import { db } from "~/lib/db.server"

export const loader = async ({ request, params }: LoaderArgs) => {
  const spot = await db.spot.findUniqueOrThrow({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      address: true,
      description: true,
      images: { select: { id: true, path: true } },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          rating: true,
          description: true,
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
      },
    },
  })

  const rating = await db.review.aggregate({ where: { spotId: params.id }, _avg: { rating: true } })

  return json(
    { ...spot, rating },
    {
      headers: {
        "Cache-Control": cacheHeader({
          public: true,
          maxAge: "1hour",
          sMaxage: "1hour",
          staleWhileRevalidate: "1day",
          staleIfError: "1day",
        }),
      },
    },
  )
}

export default function SpotDetail() {
  const spot = useLoaderData<typeof loader>()
  return (
    <div className="p-10">
      <h1 className="text-4xl">{spot.name}</h1>
    </div>
  )
}
