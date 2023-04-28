import { Outlet, useLoaderData, useNavigate, useRouteLoaderData, useSearchParams } from "@remix-run/react"
import turfCenter from "@turf/center"
import { points } from "@turf/helpers"
import { json, type HeadersFunction, type LinksFunction, type LoaderArgs } from "@vercel/remix"
import { cva } from "class-variance-authority"
import mapStyles from "mapbox-gl/dist/mapbox-gl.css"
import { cacheHeader } from "pretty-cache-header"
import queryString from "query-string"
import * as React from "react"
import type { ViewStateChangeEvent } from "react-map-gl"
import Map, { GeolocateControl, Marker, NavigationControl, type LngLatLike, type MapRef } from "react-map-gl"

import { ClientOnly } from "@travel/shared"

import { useTheme } from "~/lib/theme"
import { getMapSpots } from "~/services/spots.server"
import type { IpInfo } from "./_app"

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
  const spots = await getMapSpots(request)
  return json(spots)
}

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: mapStyles }]
}

export default function MapView() {
  const spots = useLoaderData<typeof loader>()
  const ipInfo = useRouteLoaderData("pages/_app") as IpInfo
  console.log({ ipInfo })

  const [searchParams, setSearchParams] = useSearchParams()

  const theme = useTheme()
  const mapRef = React.useRef<MapRef>(null)

  const initialViewState = React.useMemo(() => {
    const minLat = searchParams.get("minLat")
    const maxLat = searchParams.get("maxLat")
    const minLng = searchParams.get("minLng")
    const maxLng = searchParams.get("maxLng")
    let centerFromParams
    if (minLat && maxLat && minLng && maxLng) {
      centerFromParams = turfCenter(
        points([
          [parseFloat(minLng), parseFloat(minLat)],
          [parseFloat(maxLng), parseFloat(maxLat)],
        ]),
      )
    }
    return {
      zoom: ipInfo ? 6 : 5,
      longitude: centerFromParams?.geometry.coordinates[0] || ipInfo?.longitude || 4,
      latitude: centerFromParams?.geometry.coordinates[1] || ipInfo?.latitude || 52,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onMove = (e: mapboxgl.MapboxEvent<undefined> | ViewStateChangeEvent) => {
    const bounds = e.target.getBounds()
    const zoom = Math.round(e.target.getZoom())
    const params = queryString.stringify({
      ...queryString.parse(window.location.search),
      minLat: parseFloat(bounds.getSouth().toFixed(6)),
      maxLat: parseFloat(bounds.getNorth().toFixed(6)),
      minLng: parseFloat(bounds.getWest().toFixed(6)),
      maxLng: parseFloat(bounds.getEast().toFixed(6)),
      zoom,
    })
    setSearchParams(params)
  }
  const navigate = useNavigate()
  const spotMarkers = React.useMemo(
    () =>
      spots.map((point, i) => (
        <SpotMarker
          point={point}
          key={i}
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            if (!point.properties.cluster && point.properties.id) {
              const newParams = queryString.stringify(queryString.parse(window.location.search))
              navigate(`/map/${point.properties.id}?${newParams}`)
            }
            const center = point.geometry.coordinates as LngLatLike
            const currentZoom = mapRef.current?.getZoom()
            const zoom = point.properties.cluster ? Math.min((currentZoom || 5) + 2, 14) : currentZoom
            mapRef.current?.flyTo({
              center,
              duration: 1000,
              padding: 50,
              zoom,
              offset: point.properties.cluster ? [0, 0] : [100, 0],
            })
          }}
        />
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spots],
  )
  return (
    <div className="relative">
      <ClientOnly>
        <div className="relative h-screen w-screen overflow-hidden">
          <Map
            mapboxAccessToken="pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw"
            onLoad={onMove}
            onMoveEnd={onMove}
            ref={mapRef}
            style={{ height: "100%", width: "100%" }}
            initialViewState={initialViewState}
            attributionControl={false}
            mapStyle={
              theme === "dark"
                ? "mapbox://styles/jclackett/ck44lf1f60a7j1cowkgjr6f3j"
                : "mapbox://styles/jclackett/ckcqlc8j6040i1ipeuh4s5fey"
            }
          >
            {spotMarkers}

            <GeolocateControl position="bottom-right" />
            <NavigationControl position="bottom-right" />
          </Map>
          <Outlet />
        </div>
      </ClientOnly>
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

type Point = Awaited<ReturnType<typeof getMapSpots>>[number]

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
