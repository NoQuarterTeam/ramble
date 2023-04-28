import * as React from "react"
import Map, {
  FullscreenControl,
  GeolocateControl,
  type LngLatLike,
  type MapRef,
  Marker,
  NavigationControl,
  ScaleControl,
} from "react-map-gl"
import { Outlet, useFetcher, useLoaderData, useNavigate, useSearchParams } from "@remix-run/react"
import { type HeadersFunction, json, type LinksFunction, type LoaderArgs, type SerializeFrom } from "@vercel/remix"
import { cva } from "class-variance-authority"
import mapStyles from "mapbox-gl/dist/mapbox-gl.css"
import { cacheHeader } from "pretty-cache-header"
import queryString from "query-string"

import { type SpotType } from "@travel/database"
import { ClientOnly } from "@travel/shared"
import { Select } from "@travel/ui"

import { useTheme } from "~/lib/theme"
import { getIpInfo } from "~/services/ip.server"

import { type loader as spotLoader } from "./api+/spots"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": cacheHeader({
      public: true,
      maxAge: "1hour",
      sMaxage: "1hour",
      staleWhileRevalidate: "1day",
      staleIfError: "1day",
    }),
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  const ipInfo = await getIpInfo(request)
  return json(ipInfo, { headers: { "Cache-Control": cacheHeader({ private: true, maxAge: "1day" }) } })
}

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: mapStyles }]
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

type Point = SerializeFrom<typeof spotLoader>[number]

export default function MapView() {
  const ipInfo = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const type = searchParams.get("type")
  const [points, setPoints] = React.useState<Point[]>([])
  const theme = useTheme()
  const mapRef = React.useRef<MapRef>(null)
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!ipInfo) return
    const params = queryString.stringify({
      ...queryString.parse(searchParams.toString()),
      c: JSON.stringify([ipInfo?.longitude, ipInfo.latitude]),
    })
    const url = [window.location.pathname, params.toString()].join("?")
    window.history.replaceState(null, "", url)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ipInfo])

  const spotFetcher = useFetcher<typeof spotLoader>()

  const handleLoadSpots = React.useCallback(() => {
    if (!mapRef.current) return
    const bounds = mapRef.current.getBounds()
    const zoom = mapRef.current.getZoom()
    const params = queryString.stringify({
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLng: bounds.getWest(),
      maxLng: bounds.getEast(),
      zoom,
      type,
    })
    spotFetcher.load(`/api/spots?${params}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  React.useEffect(() => {
    handleLoadSpots()
  }, [handleLoadSpots])

  React.useEffect(() => {
    if (!spotFetcher.data || spotFetcher.state === "loading") return
    setPoints(spotFetcher.data)
  }, [spotFetcher.data, spotFetcher.state])

  const spotMarkers = React.useMemo(
    () =>
      points.map((point, i) => (
        <SpotMarker
          point={point}
          key={i}
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            const center = point.geometry.coordinates as LngLatLike
            const currentZoom = mapRef.current?.getZoom()
            const zoom = point.properties.cluster ? Math.min((currentZoom || 5) + 2, 14) : currentZoom
            mapRef.current?.flyTo({
              center,
              duration: 500,
              padding: 50,
              zoom,
              offset: point.properties.cluster ? [0, 0] : [100, 0],
            })

            if (!point.properties.cluster && point.properties.id) {
              navigate(`/map/${point.properties.id}?${searchParams.toString()}`)
            } else {
              navigate(`/map?${searchParams.toString()}`)
            }
            const newParams = queryString.stringify({
              ...queryString.parse(searchParams.toString()),
              c: JSON.stringify(center),
            })
            const url = [window.location.pathname, newParams.toString()].join("?")
            window.history.replaceState(null, "", url)
          }}
        />
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points],
  )

  const center = queryString.parse(searchParams.toString()).c as string | undefined
  const longitude = center ? JSON.parse(center)[0] : ipInfo?.longitude || 4
  const latitude = center ? JSON.parse(center)[1] : ipInfo?.latitude || 50

  return (
    <div className="relative">
      <ClientOnly>
        <div className="relative h-screen w-screen overflow-hidden">
          <Map
            mapboxAccessToken="pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw"
            onLoad={handleLoadSpots}
            onMoveEnd={(e) => {
              handleLoadSpots()
              const newCenter = [e.viewState.longitude, e.viewState.latitude]
              const newParams = queryString.stringify({
                ...queryString.parse(searchParams.toString()),
                c: JSON.stringify(newCenter),
              })
              const url = [window.location.pathname, newParams.toString()].join("?")
              window.history.replaceState(null, "", url)
            }}
            ref={mapRef}
            style={{ height: "100%", width: "100%" }}
            initialViewState={{ longitude, latitude, zoom: ipInfo ? 6 : 5 }}
            attributionControl={false}
            mapStyle={
              theme === "dark"
                ? "mapbox://styles/jclackett/ck44lf1f60a7j1cowkgjr6f3j"
                : "mapbox://styles/jclackett/ckcqlc8j6040i1ipeuh4s5fey"
            }
          >
            {spotMarkers}
            <GeolocateControl position="bottom-right" />
            <FullscreenControl position="bottom-right" />
            <NavigationControl position="bottom-right" />
            <ScaleControl />
          </Map>
        </div>
      </ClientOnly>
      <div className="top-nav absolute right-6 mt-4 bg-white shadow-md dark:bg-gray-900">
        <Select
          defaultValue={type || ""}
          className="cursor-pointer"
          onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
        >
          <option value="">All</option>
          {SPOT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>
      <Outlet />
    </div>
  )
}

const spotMarkerColors = cva("cursor-pointer hover:scale-110 border sq-5 shadow-sm rounded-full", {
  variants: {
    type: {
      CAFE: "bg-blue-500 dark:bg-blue-900 border-blue-800 dark:border-blue-400",
      RESTAURANT: "bg-purple-500 dark:bg-purple-900 border-purple-900 dark:border-purple-400",
      CAMPING: "bg-green-500 dark:bg-green-900 border-green-800 dark:border-green-600",
      PARKING: "bg-gray-500 dark:bg-gray-900 border-gray-800 dark:border-gray-400",
      BAR: "bg-red-500 dark:bg-red-900 border-red-800 dark:border-red-400",
      TIP: "bg-white dark:bg-gray-900",
      SHOP: "bg-white dark:bg-gray-900",
      CLIMBING: "bg-white dark:bg-gray-900",
      MOUNTAIN_BIKING: "bg-white dark:bg-gray-900",
      GAS_STATION: "bg-white dark:bg-gray-900",
      SUPPING: "bg-white dark:bg-gray-900",
      VIEW: "bg-white dark:bg-gray-900",
      OTHER: "bg-white dark:bg-gray-900",
    },
  },
})

interface MarkerProps {
  onClick: (e: mapboxgl.MapboxEvent<MouseEvent>) => void
  point: Point
}
function SpotMarker(props: MarkerProps) {
  return (
    <Marker
      onClick={props.onClick}
      anchor="bottom"
      longitude={props.point.geometry.coordinates[0]}
      latitude={props.point.geometry.coordinates[1]}
    >
      {props.point.properties.cluster ? (
        <div className="sq-8 flex cursor-pointer items-center justify-center rounded-full border border-green-600 bg-green-400 hover:scale-110 dark:border-green-300 dark:bg-green-700">
          <p className="text-center text-sm">{props.point.properties.point_count_abbreviated}</p>
        </div>
      ) : (
        <div className={spotMarkerColors({ type: props.point.properties.type })} />
      )}
    </Marker>
  )
}
