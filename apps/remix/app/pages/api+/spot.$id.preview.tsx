import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import { notFound } from "remix-utils"

import { db } from "~/lib/db.server"

export const loader = async ({ params }: LoaderArgs) => {
  const spot = await db.spot.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      address: true,
      images: { select: { id: true, path: true } },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          rating: true,
          description: true,
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      },
    },
  })
  // await new Promise((r) => setTimeout(r, 2000))
  if (!spot) throw notFound("Spot not found")
  const averageRating = await db.review.aggregate({ where: { spotId: params.id }, _avg: { rating: true } })
  return json(
    { ...spot, rating: averageRating._avg.rating?.toFixed(1) },
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
