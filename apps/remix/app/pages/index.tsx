import { useLoaderData, useSearchParams } from "@remix-run/react"
import { SpotType } from "@travel/database"
import { ClientOnly } from "@travel/shared"
import { CloseButton, Select } from "@travel/ui"
import bbox from "@turf/bbox"
import { json, LinksFunction, SerializeFrom, type LoaderArgs } from "@vercel/remix"
import { cva } from "class-variance-authority"
import mapStyles from "mapbox-gl/dist/mapbox-gl.css"
import * as React from "react"
import Map, { FullscreenControl, GeolocateControl, MapRef, Marker, NavigationControl, ScaleControl } from "react-map-gl"
import { z } from "zod"
import { Nav } from "~/components/Nav"
import { db } from "~/lib/db.server"
import { useTheme } from "~/lib/theme"
import { getMaybeUser } from "~/services/auth/auth.server"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: mapStyles }]
}
export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url)
  const paramType = url.searchParams.get("type")
  let type
  if (paramType) {
    type = await z.nativeEnum(SpotType).nullable().optional().parseAsync(url.searchParams.get("type"))
  }

  const user = await getMaybeUser(request)
  const spots = await db.spot.findMany({
    take: 50,
    where: {
      type: type ? { equals: type } : undefined,
    },
    orderBy: { createdAt: "desc" },
  })
  return json({ user, spots })
}

const SPOT_OPTIONS: { label: string; value: SpotType }[] = [
  { label: "Cafe", value: "CAFE" },
  { label: "Restaurant", value: "RESTAURANT" },
  { label: "Camping", value: "CAMPING" },
  { label: "Parking", value: "PARKING" },
  { label: "Bar", value: "BAR" },
  { label: "Tip", value: "TIP" },
  { label: "Shop", value: "SHOP" },
  { label: "Climbing", value: "CLIMBING" },
  { label: "Mountain Biking", value: "MOUNTAIN_BIKING" },
  { label: "Gas Station", value: "GAS_STATION" },
  { label: "SUPing", value: "SUPPING" },
  { label: "Other", value: "OTHER" },
]

export type IndexUser = SerializeFrom<typeof loader>["user"]

export default function Home() {
  const { user, spots } = useLoaderData<typeof loader>()

  const [searchParams, setSearchParams] = useSearchParams()
  const type = searchParams.get("type")

  return (
    <div className="relative">
      <Nav user={user} />
      <ClientOnly>
        <MapView spots={spots} />
      </ClientOnly>
      <div className="top-nav absolute right-6 mt-4 bg-white shadow-md dark:bg-gray-900">
        <Select defaultValue={type || ""} className="cursor-pointer" onChange={(e) => setSearchParams({ type: e.target.value })}>
          <option value="">All</option>
          {SPOT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}

const spotMarkerColors = cva("cursor-pointer hover:scale-110 border sq-5 shadow-sm rounded-full bg-white dark:bg-black", {
  variants: {
    type: {
      CAFE: "bg-blue-500 dark:bg-blue-900 border-blue-800 dark:border-blue-400",
      RESTAURANT: "bg-purple-500 dark:bg-purple-900 border-purple-900 dark:border-purple-400",
      CAMPING: "bg-green-500 dark:bg-green-900 border-green-800 dark:border-green-600",
      PARKING: "bg-gray-500 dark:bg-gray-900 border-gray-800 dark:border-gray-400",
      BAR: "bg-red-500 dark:bg-red-900 border-red-800 dark:border-red-400",
      TIP: "",
      SHOP: "",
      CLIMBING: "",
      MOUNTAIN_BIKING: "",
      GAS_STATION: "",
      SUPPING: "",
      VIEW: "",
      OTHER: "",
    },
  },
})

type Spot = SerializeFrom<typeof loader>["spots"][number]

function MapView({ spots }: { spots: Spot[] }) {
  const theme = useTheme()
  const mapRef = React.useRef<MapRef>(null)

  const [activeSpot, setActiveSpot] = React.useState<Spot | null>(null)

  const spotMarkers = React.useMemo(
    () =>
      spots.map((spot) => (
        <Marker
          key={spot.id}
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            setActiveSpot(spot)
            mapRef.current?.flyTo({ center: [spot.longitude, spot.latitude], duration: 500, padding: 50, offset: [0, -100] })
          }}
          anchor="bottom"
          latitude={spot.latitude}
          longitude={spot.longitude}
        >
          <div className={spotMarkerColors({ type: spot.type })} />
        </Marker>
      )),
    [spots],
  )
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Map
        onMoveEnd={(e) => {
          console.log(e)
        }}
        ref={mapRef}
        style={{ height: "100%", width: "100%" }}
        initialViewState={{ longitude: 4, latitude: 50, zoom: 5 }}
        attributionControl={false}
        mapStyle={
          theme === "dark"
            ? "mapbox://styles/jclackett/ck44lf1f60a7j1cowkgjr6f3j"
            : "mapbox://styles/jclackett/ckcqlc8j6040i1ipeuh4s5fey"
        }
        mapboxAccessToken="pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw"
      >
        {spotMarkers}
        <GeolocateControl position="bottom-right" />
        <FullscreenControl position="bottom-right" />
        <NavigationControl position="bottom-right" />
        <ScaleControl />
      </Map>
      {!!activeSpot && (
        <div className="absolute bottom-8 left-8 right-8 z-[1000] h-[400px] rounded-md bg-white p-10 dark:bg-gray-900">
          <div className="flex justify-between">
            <p>{activeSpot.name}</p>
            <CloseButton onClick={() => setActiveSpot(null)} />
          </div>
          <p>{activeSpot.address}</p>
        </div>
      )}
    </div>
  )
}
