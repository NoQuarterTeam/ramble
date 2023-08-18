import * as React from "react"
import { useFetcher, useLoaderData, useParams } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

import { type SpotItemWithStats } from "@ramble/api/src/router/spot"

import { Button } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { notFound } from "~/lib/remix.server"

import { SpotItem } from "./components/SpotItem"

export const headers = useLoaderHeaders

const TAKE = 12
export const loader = async ({ request, params }: LoaderArgs) => {
  const user = await db.user.findUnique({ where: { username: params.username } })
  if (!user) throw notFound()
  const searchParams = new URL(request.url).searchParams
  const skip = parseInt((searchParams.get("skip") as string) || "0")

  const spots: Array<SpotItemWithStats> = await db.$queryRaw`
    SELECT
      Spot.id, Spot.name, Spot.type, Spot.address, AVG(Review.rating) as rating,
      (SELECT path FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS image,
      (SELECT blurHash FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS blurHash,
      (CAST(COUNT(ListSpot.spotId) as CHAR(32))) AS savedCount
    FROM
      Spot
    LEFT JOIN
      Review ON Spot.id = Review.spotId
    LEFT JOIN
      ListSpot ON Spot.id = ListSpot.spotId
    WHERE
      Spot.creatorId = ${user.id}
    GROUP BY
      Spot.id
    ORDER BY
      Spot.createdAt DESC, Spot.id
    LIMIT ${TAKE}
    OFFSET ${skip};
  `
  const count = await db.spot.count({ where: { creatorId: user.id } })
  return json(
    { spots, count },
    { headers: { "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour" }) } },
  )
}

export default function ProfileSpots() {
  const { spots: initialSpots, count } = useLoaderData<typeof loader>()
  const { username } = useParams()
  const spotFetcher = useFetcher<typeof loader>()
  const [spots, setSpots] = React.useState(initialSpots)

  const onNext = () => spotFetcher.load(`/${username}?skip=${spots.length}`)

  React.useEffect(() => {
    if (spotFetcher.state === "loading") return
    const data = spotFetcher.data?.spots
    if (data) setSpots((prev) => [...prev, ...data])
  }, [spotFetcher.data, spotFetcher.state])

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {count === 0 ? <></> : spots.map((spot) => <SpotItem key={spot.id} spot={spot} />)}
      </div>
      {count > TAKE && (
        <div className="flex items-center justify-center">
          <Button size="lg" isLoading={spotFetcher.state === "loading"} variant="outline" onClick={onNext}>
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
