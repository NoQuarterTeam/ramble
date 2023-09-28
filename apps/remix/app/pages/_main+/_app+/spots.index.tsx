import * as React from "react"
import { useLoaderData, useSearchParams } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import queryString from "query-string"

import { LatestSpotImages, joinSpotImages, publicSpotWhereClauseRaw, spotImagesRawQuery } from "@ramble/api"
import { Prisma, SpotType } from "@ramble/database/types"
import { useDisclosure, type SpotItemWithStatsAndImage } from "@ramble/shared"

import { Button, Modal, Select } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { SPOT_TYPE_OPTIONS } from "~/lib/static/spots"
import { getUserSession } from "~/services/session/session.server"

import { PageContainer } from "../../../components/PageContainer"
import { SpotItem } from "./components/SpotItem"
import { promiseHash } from "remix-utils"
import { useFetcher } from "~/components/Form"
import { Settings2 } from "lucide-react"

export const config = {
  // runtime: "edge",
  // regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
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
        : Prisma.sql`rating DESC, Spot.id`
    }`

  const { spots } = await promiseHash({
    spots: db.$queryRaw<Array<SpotItemWithStatsAndImage>>`
      SELECT 
        Spot.id, Spot.name, Spot.type, Spot.address, null as image, null as blurHash,
        (SELECT AVG(rating) FROM Review WHERE Review.spotId = Spot.id) AS rating,
        (CAST(COUNT(ListSpot.spotId) as CHAR(32))) AS savedCount
      FROM
        Spot
      LEFT JOIN
        ListSpot ON Spot.id = ListSpot.spotId
      ${WHERE}
      GROUP BY
        Spot.id
      ${ORDER_BY}
      LIMIT ${TAKE}
      OFFSET ${skip};
    `,
  })

  // get spot images and join to original spot payload
  const images = await db.$queryRaw<LatestSpotImages>(spotImagesRawQuery(spots.map((s) => s.id)))
  joinSpotImages(spots, images)

  return json({ spots }, { headers: { "Cache-Control": cacheHeader({ public: true, sMaxage: "1hour", maxAge: "1hour" }) } })
}

export default function Latest() {
  const { spots: initialSpots } = useLoaderData<typeof loader>()
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

  const modalProps = useDisclosure()
  return (
    <PageContainer className="pt-0">
      <div className="top-nav bg-background sticky z-[1] py-4">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="relative hidden w-[calc(100%-140px)] md:block">
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
          <div className="flex items-center gap-2 md:hidden">
            <Button onClick={modalProps.onOpen} variant="outline" leftIcon={<Settings2 size={18} />}>
              Filters
            </Button>
            {type && (
              <Button
                variant="link"
                onClick={() => {
                  const existingParams = queryString.parse(searchParams.toString())
                  setSearchParams(queryString.stringify({ ...existingParams, type: undefined }))
                }}
              >
                Clear
              </Button>
            )}
            <Modal title="Filters" {...modalProps}>
              <div className="flex flex-wrap gap-2">
                {SPOT_TYPE_OPTIONS.map(({ value, Icon, label }) => (
                  <Button
                    key={value}
                    onClick={() => {
                      const existingParams = queryString.parse(searchParams.toString())
                      setSearchParams(
                        queryString.stringify({ ...existingParams, type: type && type === value ? undefined : value }),
                      )
                      modalProps.onClose()
                    }}
                    variant={type === value ? "primary" : "outline"}
                    leftIcon={<Icon size={16} />}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </Modal>
          </div>
          <div className="w-[140px]">
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
        {spots.length === 0 ? (
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
        {spots.length % TAKE === 0 && (
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
