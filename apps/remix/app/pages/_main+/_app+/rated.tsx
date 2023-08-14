import * as React from "react"
import { useFetcher, useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

import { type SpotItemWithImageAndRating } from "@ramble/api/src/router/spot"

import { Button } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"

import { PageContainer } from "../../../components/PageContainer"
import { SpotItem } from "./components/SpotItem"

export const config = {
  runtime: "edge",
  regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

export const headers = useLoaderHeaders

export const loader = async ({ request }: LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams
  const skip = parseInt((searchParams.get("skip") as string) || "0")

  const spots: Array<SpotItemWithImageAndRating> = await db.$queryRaw`
    SELECT 
      Spot.id, Spot.name, Spot.address, AVG(Review.rating) as rating,
      (SELECT path FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS image,
      (SELECT blurHash FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS blurHash
    FROM
      Spot
    LEFT JOIN
      Review ON Spot.id = Review.spotId
    GROUP BY
      Spot.id
    ORDER BY
      rating DESC, Spot.id
    LIMIT 10
    OFFSET ${skip};
  `

  const count = await db.spot.count()
  return json(
    { spots, count },
    { headers: { "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour" }) } },
  )
}

export default function Rated() {
  const { spots: initialSpots, count } = useLoaderData<typeof loader>()

  const spotFetcher = useFetcher<typeof loader>()
  const [spots, setSpots] = React.useState(initialSpots)

  const onNext = () => spotFetcher.load(`/rated?skip=${spots.length}`)

  React.useEffect(() => {
    if (spotFetcher.state === "loading") return
    const data = spotFetcher.data?.spots
    if (data) setSpots((prev) => [...prev, ...data])
  }, [spotFetcher.data, spotFetcher.state])

  return (
    <PageContainer>
      <h1 className="text-3xl">Top rated spots</h1>
      <div className="space-y-2">
        {spots.map((spot) => (
          <SpotItem key={spot.id} spot={spot} />
        ))}
        {count > 10 && (
          <div className="flex items-center justify-center">
            <Button size="lg" isLoading={spotFetcher.state === "loading"} variant="outline" onClick={onNext}>
              Load more
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
