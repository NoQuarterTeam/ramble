import * as React from "react"
import { useFetcher, useLoaderData, useParams } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

import { publicSpotWhereClause, publicSpotWhereClauseRaw } from "@ramble/api"
import { type SpotItemWithStats } from "@ramble/shared"

import { Button } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { notFound } from "~/lib/remix.server"
import { getUserSession } from "~/services/session/session.server"

import { SpotItem } from "./components/SpotItem"

export const headers = useLoaderHeaders

const TAKE = 12
export const loader = async ({ request, params }: LoaderArgs) => {
  const user = await db.user.findUnique({ where: { username: params.username } })
  if (!user) throw notFound()
  const searchParams = new URL(request.url).searchParams
  const skip = parseInt((searchParams.get("skip") as string) || "0")
  const { userId } = await getUserSession(request)
  const [spots, count] = await Promise.all([
    db.$queryRaw<SpotItemWithStats[]>`
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
        Spot.creatorId = ${user.id} AND ${publicSpotWhereClauseRaw(userId)}
      GROUP BY
        Spot.id
      ORDER BY
        Spot.createdAt DESC, Spot.id
      LIMIT ${TAKE}
      OFFSET ${skip};
    `,
    db.spot.count({ where: { creatorId: user.id, ...publicSpotWhereClause(userId) } }),
  ])

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

  const onNext = () => spotFetcher.load(`/${username}?index&skip=${spots.length}`)

  React.useEffect(() => {
    if (spotFetcher.state === "loading") return
    const data = spotFetcher.data?.spots
    if (data) setSpots((prev) => [...prev, ...data])
  }, [spotFetcher.data, spotFetcher.state])

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {count === 0 ? <></> : spots.map((spot) => <SpotItem key={spot.id} spot={spot} />)}
      </div>
      {count > spots.length && (
        <div className="center">
          <Button size="lg" isLoading={spotFetcher.state === "loading"} variant="outline" onClick={onNext}>
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
