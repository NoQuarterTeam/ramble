import * as React from "react"
import type { ViewStateChangeEvent } from "react-map-gl"
import Map, { GeolocateControl, type LngLatLike, type MapRef, Marker, NavigationControl } from "react-map-gl"
import { Outlet, useFetcher, useNavigate, useRouteLoaderData, useSearchParams } from "@remix-run/react"
import turfCenter from "@turf/center"
import * as turf from "@turf/helpers"
import { type LinksFunction } from "@vercel/remix"
import mapStyles from "mapbox-gl/dist/mapbox-gl.css"
import queryString from "query-string"

import type { SpotType } from "@ramble/database/types"
import { ClientOnly, INITIAL_LATITUDE, INITIAL_LONGITUDE } from "@ramble/shared"

import { SPOTS } from "~/lib/spots"
import { useTheme } from "~/lib/theme"
import { MapFilters } from "~/pages/_app+/components/MapFilters"

import type { Cluster, clustersLoader } from "../api+/clusters"
import type { IpInfo } from "./_layout"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: mapStyles }]
}

export default function MapView() {
  const clustersFetcher = useFetcher<typeof clustersLoader>()
  const ipInfo = useRouteLoaderData("pages/_app") as IpInfo

  const clusters = clustersFetcher.data

  const theme = useTheme()
  const mapRef = React.useRef<MapRef>(null)

  const [searchParams] = useSearchParams()
  const initialViewState = React.useMemo(() => {
    const zoom = searchParams.get("zoom")
    const minLat = searchParams.get("minLat")
    const maxLat = searchParams.get("maxLat")
    const minLng = searchParams.get("minLng")
    const maxLng = searchParams.get("maxLng")
    let centerFromParams
    if (minLat && maxLat && minLng && maxLng) {
      centerFromParams = turfCenter(
        turf.points([
          [parseFloat(minLng), parseFloat(minLat)],
          [parseFloat(maxLng), parseFloat(maxLat)],
        ]),
      )
    }

    return {
      zoom: zoom ? parseInt(zoom) : ipInfo ? 6 : 5,
      longitude: centerFromParams?.geometry.coordinates[0] || ipInfo?.longitude || INITIAL_LONGITUDE,
      latitude: centerFromParams?.geometry.coordinates[1] || ipInfo?.latitude || INITIAL_LATITUDE,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onParamsChange = (params: string) => {
    clustersFetcher.load(`/api/clusters?${params}`)
    window.history.replaceState(null, "", `${window.location.pathname}?${params}`)
  }
  const onMove = (e: mapboxgl.MapboxEvent<undefined> | ViewStateChangeEvent) => {
    const bounds = e.target.getBounds()
    const zoom = Math.round(e.target.getZoom())
    const params = queryString.stringify(
      {
        ...queryString.parse(window.location.search, { arrayFormat: "bracket" }),
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
        zoom,
      },
      { arrayFormat: "bracket" },
    )
    onParamsChange(params)
  }
  const navigate = useNavigate()

  const markers = React.useMemo(
    () =>
      clusters?.map((point, i) => (
        <SpotMarker
          point={point}
          key={i}
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            if (!point.properties.cluster && point.properties.id) {
              navigate(`/map/${point.properties.id}${window.location.search}`)
            }
            const center = point.geometry.coordinates as LngLatLike
            const currentZoom = mapRef.current?.getZoom()
            const zoom = point.properties.cluster ? Math.min((currentZoom || 5) + 2, 14) : currentZoom
            mapRef.current?.flyTo({
              center,
              duration: 1000,
              padding: 50,
              zoom,
              offset: point.properties.cluster ? [0, 0] : [250, 0],
            })
          }}
        />
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clusters],
  )
  const noMap = searchParams.get("noMap")
  return (
    <div className="h-nav-screen relative w-screen overflow-hidden">
      {!noMap && (
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
              ? "mapbox://styles/jclackett/clh82otfi00ay01r5bftedls1"
              : "mapbox://styles/jclackett/clh82jh0q00b601pp2jfl30sh"
          }
        >
          {markers}

          <GeolocateControl position="bottom-right" />
          <NavigationControl position="bottom-right" />
        </Map>
      )}

      <ClientOnly>
        <MapFilters onChange={onParamsChange} />
      </ClientOnly>

      <Outlet />
    </div>
  )
}

// const spotMarkerColors = cva("relative cursor-pointer hover:scale-110 rounded-full sq-8", {
//   variants: {
//     type: {
//       CAFE: "bg-blue-700 dark:bg-blue-900",
//       RESTAURANT: "bg-purple-500 dark:bg-purple-900",
//       CAMPING: "bg-green-500 dark:bg-green-900",
//       PARKING: "bg-gray-500 dark:bg-gray-900",
//       BAR: "bg-red-500 dark:bg-red-900",
//       TIP: "bg-white dark:bg-gray-900",
//       SHOP: "bg-white dark:bg-gray-900",
//       CLIMBING: "bg-white dark:bg-gray-900",
//       MOUNTAIN_BIKING: "bg-white dark:bg-gray-900",
//       GAS_STATION: "bg-white dark:bg-gray-900",
//       PADDLE_BOARDING: "bg-white dark:bg-gray-900",
//       VIEW: "bg-white dark:bg-gray-900",
//       OTHER: "bg-white dark:bg-gray-900",
//     },
//   },
// })

interface MarkerProps {
  onClick: (e: mapboxgl.MapboxEvent<MouseEvent>) => void
  point: Cluster
}
function SpotMarker(props: MarkerProps) {
  const Icon = !props.point.properties.cluster && SPOTS[props.point.properties.type as SpotType].Icon
  return (
    <Marker
      onClick={props.onClick}
      anchor="bottom"
      longitude={props.point.geometry.coordinates[0]}
      latitude={props.point.geometry.coordinates[1]}
    >
      {props.point.properties.cluster ? (
        <div className="sq-10 border-primary-100 bg-primary-800 dark:border-primary-700 dark:bg-primary-900 flex cursor-pointer items-center justify-center rounded-full border text-white shadow transition-transform hover:scale-110">
          <p className="text-center text-sm">{props.point.properties.point_count_abbreviated}</p>
        </div>
      ) : (
        <div className="relative">
          <div className="sq-8 bg-primary-600 dark:bg-primary-700 border-primary-100 dark:border-primary-600 flex cursor-pointer items-center justify-center rounded-full border shadow-md transition-transform hover:scale-110">
            {Icon && <Icon className="sq-4 text-white" />}
          </div>
          <div className="sq-3 bg-primary-600 dark:bg-primary-700 absolute -bottom-[3px] left-1/2 -z-[1] -translate-x-1/2 rotate-45 shadow" />
        </div>
      )}
    </Marker>
  )
}
