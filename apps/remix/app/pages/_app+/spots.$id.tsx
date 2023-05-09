import { useLoaderData } from "@remix-run/react"
import { createImageUrl } from "@travel/shared"
import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { Verified } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"

import { db } from "~/lib/db.server"

export const loader = async ({ params }: LoaderArgs) => {
  const spot = await db.spot.findUniqueOrThrow({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      verifiedAt: true,
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
    <div className="p-4 md:p-10 md:px-20">
      <h1 className="text-4xl">
        <span>{spot.name}</span>
        {spot.verifiedAt && <Verified className="sq-5 ml-1" />}
      </h1>
      <p className="text-2xl">{spot.address}</p>
      <p className="text-xl">{spot.description}</p>
      <div className="flex flex-wrap">
        {spot.images.map((image) => (
          <img alt="spot" key={image.id} src={createImageUrl(image.path)} className="w-1/2" />
        ))}
      </div>
    </div>
  )
}
