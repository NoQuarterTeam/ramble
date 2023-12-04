import * as React from "react"
import { useFetcher, useLoaderData, useParams } from "@remix-run/react"
import { cacheHeader } from "pretty-cache-header"
import { promiseHash } from "remix-utils/promise"

import { publicSpotWhereClauseRaw, spotItemDistanceFromMeField, spotItemSelectFields } from "@ramble/server-services"
import { type SpotItemType } from "@ramble/shared"

import { Button } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { fetchAndJoinSpotImages } from "~/lib/models/spot"
import { notFound } from "~/lib/remix.server"
import type { LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"

import { SpotItem } from "./components/SpotItem"
import { getMaybeUser } from "~/services/auth/auth.server"

export const headers = useLoaderHeaders

const TAKE = 12
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await db.user.findUnique({ where: { username: params.username?.toLowerCase().trim() } })
  if (!user) throw notFound()
  const searchParams = new URL(request.url).searchParams
  const skip = parseInt((searchParams.get("skip") as string) || "0")
  const currentUser = await getMaybeUser(request, { id: true, latitude: true, longitude: true })

  const { spots } = await promiseHash({
    spots: db.$queryRaw<SpotItemType[]>`
      SELECT
        ${spotItemDistanceFromMeField(currentUser)},
        ${spotItemSelectFields}
      FROM
        Spot
      WHERE
        Spot.creatorId = ${user.id} AND ${publicSpotWhereClauseRaw(currentUser?.id)} AND Spot.sourceUrl IS NULL
      GROUP BY
        Spot.id
      ORDER BY
        Spot.createdAt DESC, Spot.id
      LIMIT ${TAKE}
      OFFSET ${skip};
    `,
  })

  await fetchAndJoinSpotImages(spots)

  return json(
    { spots },
    {
      headers: {
        "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min" }),
      },
    },
  )
}

export default function ProfileSpots() {
  const { spots: initialSpots } = useLoaderData<typeof loader>()
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {spots.length === 0 ? <></> : spots.map((spot) => <SpotItem key={spot.id} spot={spot} />)}
      </div>
      {spots.length !== 0 && spots.length % TAKE === 0 && (
        <div className="center">
          <Button size="lg" isLoading={spotFetcher.state === "loading"} variant="outline" onClick={onNext}>
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
