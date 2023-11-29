import "mapbox-gl/dist/mapbox-gl.css"

import * as React from "react"
import Map, { GeolocateControl, type LngLatLike, type MapRef, Marker, NavigationControl } from "react-map-gl"
import { Form, useLoaderData, useSearchParams } from "@remix-run/react"
import { MapIcon } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"
import { ExistingSearchParams } from "remix-utils/existing-search-params"
import { promiseHash } from "remix-utils/promise"

import { Prisma, SpotType } from "@ramble/database/types"
import { publicSpotWhereClauseRaw } from "@ramble/server-services"
import { INITIAL_LATITUDE, INITIAL_LONGITUDE, join, type SpotItemWithStatsAndImage, STAY_SPOT_TYPE_OPTIONS } from "@ramble/shared"

import { SpotIcon } from "~/components/SpotIcon"
import { Button, IconButton, Select } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { fetchAndJoinSpotImages } from "~/lib/models/spot"
import { useTheme } from "~/lib/theme"
import { bbox, lineString } from "~/lib/vendor/turf.server"
import type { LoaderFunctionArgs, SerializeFrom } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { getUserSession } from "~/services/session/session.server"

import { PageContainer } from "../../../components/PageContainer"
import { SpotItem } from "./components/SpotItem"
import { SpotMarker } from "./components/SpotMarker"

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

type SpotItemWithStatsAndCoords = SpotItemWithStatsAndImage & { longitude: number; latitude: number }

const TAKE = 24
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { userId } = await getUserSession(request)
  const searchParams = new URL(request.url).searchParams

  let type = searchParams.get("type") as SpotType | undefined
  if (type && !SpotType[type as SpotType]) type = undefined
  let sort = searchParams.get("sort") || "latest"
  if (!SORT_OPTIONS.find((o) => o.value === sort)) sort = "latest"

  const WHERE = type
    ? Prisma.sql`WHERE Spot.verifiedAt IS NOT NULL AND Spot.type = ${type} AND ${publicSpotWhereClauseRaw(userId)}`
    : Prisma.sql`WHERE Spot.verifiedAt IS NOT NULL AND Spot.type IN (${Prisma.join([
        SpotType.CAMPING,
        SpotType.FREE_CAMPING,
      ])}) AND ${publicSpotWhereClauseRaw(userId)} `

  const ORDER_BY = Prisma.sql // prepared orderBy
  `ORDER BY
    ${
      sort === "latest"
        ? Prisma.sql`Spot.verifiedAt DESC, Spot.id`
        : sort === "saved"
          ? Prisma.sql`savedCount DESC, Spot.id`
          : Prisma.sql`rating DESC, Spot.id`
    }`

  const { spots } = await promiseHash({
    spots: db.$queryRaw<Array<SpotItemWithStatsAndCoords>>`
      SELECT 
        Spot.id, Spot.name, Spot.type, Spot.address, null as image, null as blurHash,
        Spot.latitude, Spot.longitude,
        (SELECT AVG(rating) FROM Review WHERE Review.spotId = Spot.id) AS rating,
        CAST((SELECT COUNT(ListSpot.spotId) FROM ListSpot WHERE ListSpot.spotId = Spot.id) AS CHAR(32)) AS savedCount
      FROM
        Spot
      ${WHERE}
      GROUP BY
        Spot.id
      ${ORDER_BY}
      LIMIT ${TAKE};
    `,
  })
  await fetchAndJoinSpotImages(spots)
  const coords = spots.length > 1 ? spots.map((spot) => [spot.longitude, spot.latitude]) : null

  let bounds: LngLatLike | undefined = undefined
  if (coords) {
    const line = lineString(coords)
    bounds = bbox(line) as unknown as LngLatLike
  }

  return json(
    { spots, bounds },
    {
      headers: {
        "Cache-Control": cacheHeader({ public: true, sMaxage: "1hour", staleWhileRevalidate: "1min", maxAge: "1hour" }),
      },
    },
  )
}

export default function Latest() {
  const { spots, bounds } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const type = searchParams.get("type") || ""
  const sort = searchParams.get("sort") || "latest"
  const isMapVisible = searchParams.get("map") === "true" || false
  const scrollRef = React.useRef<HTMLDivElement>(null)

  return (
    <PageContainer className="pt-0">
      <div className="top-nav bg-background sticky z-[1] py-4">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex gap-1">
            <Form>
              <ExistingSearchParams exclude={["type"]} />
              <Button type="submit" variant={!type ? "primary" : "outline"}>
                All
              </Button>
            </Form>
            {STAY_SPOT_TYPE_OPTIONS.map(({ value, label }) => (
              <Form key={value}>
                <ExistingSearchParams exclude={["type"]} />
                <Button
                  type="submit"
                  name="type"
                  value={value}
                  className="hidden md:flex"
                  variant={type === value ? "primary" : "outline"}
                  leftIcon={<SpotIcon type={value} className="sq-4" />}
                >
                  {label}
                </Button>
                <IconButton
                  aria-label={`Filter ${label}`}
                  icon={<SpotIcon type={value} className="sq-4" />}
                  type="submit"
                  name="type"
                  className="flex md:hidden"
                  value={value}
                  variant={type === value ? "primary" : "outline"}
                />
              </Form>
            ))}
          </div>

          <div className="flex items-center space-x-1">
            <div className="w-[140px]">
              <Form>
                <ExistingSearchParams exclude={["sort"]} />
                <Select
                  defaultValue={sort}
                  name="sort"
                  onChange={(e) => {
                    e.currentTarget.form?.dispatchEvent(new Event("submit", { bubbles: true }))
                  }}
                >
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Form>
            </div>
            <Form>
              <ExistingSearchParams exclude={["map"]} />
              <IconButton
                name="map"
                value={isMapVisible ? undefined : "true"}
                className="hidden md:block"
                variant={isMapVisible ? "primary" : "outline"}
                aria-label="toggle map"
                icon={<MapIcon size={18} />}
                type="submit"
              />
            </Form>
          </div>
        </div>
      </div>
      <div className={join(isMapVisible && "grid grid-cols-2 gap-4 md:h-[78vh] lg:grid-cols-3")}>
        <div
          ref={scrollRef}
          key={sort + type}
          className={join("space-y-10", isMapVisible ? "scrollbar-hide col-span-2 overflow-y-scroll md:col-span-1" : " pb-20")}
        >
          {spots.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 p-10">
              <p className="text-xl">No spots yet</p>
              {type && (
                <Form>
                  <ExistingSearchParams exclude={["type"]} />
                  <Button type="submit" variant="outline">
                    Clear filter
                  </Button>
                </Form>
              )}
            </div>
          ) : (
            <div className={join("grid grid-cols-1 gap-4", !isMapVisible && "md:grid-cols-2 lg:grid-cols-3")}>
              {spots.map((spot) => (
                <SpotItem key={spot.id} spot={spot} />
              ))}
            </div>
          )}
        </div>
        {isMapVisible && (
          <SpotsMap spots={spots} bounds={bounds} onClick={(index) => scrollRef.current?.scrollTo({ top: index * 340 })} />
        )}
      </div>
    </PageContainer>
  )
}

function SpotsMap({ spots, bounds, onClick }: SerializeFrom<typeof loader> & { onClick: (index: number) => void }) {
  const mapRef = React.useRef<MapRef>(null)
  const theme = useTheme()

  const markers = React.useMemo(
    () =>
      spots.map((spot, i) => {
        return (
          <Marker key={spot.id} onClick={() => onClick(i)} anchor="bottom" longitude={spot.longitude} latitude={spot.latitude}>
            <SpotMarker spot={spot} />
          </Marker>
        )
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spots],
  )
  React.useEffect(() => {
    if (!mapRef.current) return
    if (!bounds) return
    mapRef.current.fitBounds(bounds, { padding: 50 })
  }, [bounds])
  return (
    <div className="rounded-xs col-span-1 hidden overflow-hidden md:block lg:col-span-2">
      <Map
        ref={mapRef}
        mapboxAccessToken="pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw"
        maxZoom={20}
        style={{ height: "100%", width: "100%" }}
        initialViewState={
          bounds
            ? { bounds, fitBoundsOptions: { padding: 50 } }
            : {
                latitude: spots[0]?.latitude || INITIAL_LATITUDE,
                longitude: spots[0]?.longitude || INITIAL_LONGITUDE,
                zoom: 10,
              }
        }
        attributionControl={false}
        mapStyle={
          theme === "dark"
            ? "mapbox://styles/jclackett/clh82otfi00ay01r5bftedls1"
            : "mapbox://styles/jclackett/clh82jh0q00b601pp2jfl30sh"
        }
      >
        {markers}
        <GeolocateControl position="bottom-right" />
        <NavigationControl position="bottom-right" />
      </Map>
    </div>
  )
}
