import * as React from "react"
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import queryString from "query-string"

import { publicSpotWhereClauseRaw } from "@ramble/api"
import { Prisma, SpotType } from "@ramble/database/types"
import { type SpotItemWithStats } from "@ramble/shared"

import { Button, Select } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { SPOT_TYPE_OPTIONS } from "~/lib/static/spots"
import { getUserSession } from "~/services/session/session.server"

import { PageContainer } from "../../../components/PageContainer"
import { SpotItem } from "./components/SpotItem"

export const config = {
  runtime: "edge",
  regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

export const headers = useLoaderHeaders

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "rated", label: "Top rated" },
  { value: "saved", label: "Most saved" },
] as const

const TAKE = 12
export const loader = async ({ request }: LoaderArgs) => {
  const { userId } = await getUserSession(request)
  const searchParams = new URL(request.url).searchParams
  const skip = parseInt((searchParams.get("skip") as string) || "0")

  let type = searchParams.get("type") as SpotType | undefined
  if (type && !SpotType[type as SpotType]) type = undefined
  let sort = searchParams.get("sort") || "latest"
  if (!SORT_OPTIONS.find((o) => o.value === sort)) sort = "latest"

  const WHERE = type
    ? Prisma.sql`WHERE Spot.type = ${type} AND ${publicSpotWhereClauseRaw(userId)}`
    : Prisma.sql`WHERE ${publicSpotWhereClauseRaw(userId)}`

  const ORDER_BY = Prisma.sql // prepared orderBy
  `ORDER BY
    ${
      sort === "latest"
        ? Prisma.sql`Spot.createdAt DESC, Spot.id`
        : sort === "saved"
        ? Prisma.sql`savedCount DESC, Spot.id`
        : Prisma.sql`AVG(Review.rating) DESC, Spot.id`
    }
  `

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
    ${WHERE}
    GROUP BY
      Spot.id
    ${ORDER_BY}
    LIMIT ${TAKE}
    OFFSET ${skip};
  `

  const count = await db.spot.count({ where: type ? { type: type as SpotType } : undefined })
  return json(
    { spots, count },
    { headers: { "Cache-Control": cacheHeader({ public: true, sMaxage: "1hour", maxAge: "1hour" }) } },
  )
}

export default function Latest() {
  const { spots: initialSpots, count } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const type = searchParams.get("type") || ""
  const sort = searchParams.get("sort") || "latest"
  const spotFetcher = useFetcher<typeof loader>()
  const [spots, setSpots] = React.useState(initialSpots)

  const onNext = () => spotFetcher.load(`/spots?skip=${spots.length}&type=${type}&sort=${sort}`)

  React.useEffect(() => {
    setSpots(initialSpots)
  }, [initialSpots])

  React.useEffect(() => {
    if (spotFetcher.state === "loading") return
    const data = spotFetcher.data?.spots
    if (data) setSpots((prev) => [...prev, ...data])
  }, [spotFetcher.data, spotFetcher.state])

  return (
    <PageContainer className="pt-0">
      <div className="top-nav bg-background sticky z-[1] py-4">
        <div className="flex w-full items-center gap-2">
          <div className="relative w-[calc(100%-120px)]">
            <div className="scrollbar-hide flex gap-1 overflow-x-scroll pr-10">
              <Button
                onClick={() => {
                  const existingParams = queryString.parse(searchParams.toString())
                  setSearchParams(queryString.stringify({ ...existingParams, type: undefined }))
                }}
                variant={!type ? "primary" : "outline"}
              >
                All
              </Button>
              {SPOT_TYPE_OPTIONS.map(({ value, Icon, label }) => (
                <Button
                  key={value}
                  onClick={() => {
                    const existingParams = queryString.parse(searchParams.toString())
                    setSearchParams(
                      queryString.stringify({ ...existingParams, type: type && type === value ? undefined : value }),
                    )
                  }}
                  variant={type === value ? "primary" : "outline"}
                  leftIcon={<Icon size={16} />}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-r from-transparent to-white dark:to-gray-800" />
          </div>
          <div className="w-[120px]">
            <Select
              defaultValue={sort}
              onChange={(e) => {
                const existingParams = queryString.parse(searchParams.toString())
                setSearchParams(queryString.stringify({ ...existingParams, sort: e.target.value }))
              }}
            >
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
      <div className="space-y-10">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-10">
            <p className="text-xl">No spots yet</p>
            {type && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchParams(queryString.stringify({ type: undefined }))
                }}
              >
                Clear filter
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {spots.map((spot) => (
              <SpotItem key={spot.id} spot={spot} />
            ))}
          </div>
        )}
        {count > spots.length && (
          <div className="center">
            <Button size="lg" isLoading={spotFetcher.state === "loading"} variant="outline" onClick={onNext}>
              Load more
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
