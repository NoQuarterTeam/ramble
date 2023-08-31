import "mapbox-gl/dist/mapbox-gl.css"

import * as React from "react"
import Map, {
  GeolocateControl,
  Layer,
  type LngLatLike,
  type MapRef,
  Marker,
  NavigationControl,
  Source,
  type ViewStateChangeEvent,
} from "react-map-gl"
import { cssBundleHref } from "@remix-run/css-bundle"
import {
  isRouteErrorResponse,
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
  useRouteError,
  useSearchParams,
} from "@remix-run/react"
import turfCenter from "@turf/center"
import * as turf from "@turf/helpers"
import type { Geo } from "@vercel/edge"
import { geolocation } from "@vercel/edge"
import type { LinksFunction, LoaderArgs, SerializeFrom } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import queryString from "query-string"

import type { SpotType } from "@ramble/database/types"
import { ClientOnly, INITIAL_LATITUDE, INITIAL_LONGITUDE } from "@ramble/shared"

import { usePreferences } from "~/lib/hooks/usePreferences"
import { useTheme } from "~/lib/theme"
import { MapFilters } from "~/pages/_main+/_app+/components/MapFilters"

import type { Cluster, clustersLoader } from "../../api+/clusters"
import { MapLayers } from "./components/MapLayers"
import { SpotMarker } from "./components/SpotMarker"

export const config = {
  runtime: "edge",
}

export const links: LinksFunction = () => {
  return cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []
}

export const loader = async ({ request }: LoaderArgs) => {
  const geo = geolocation(request) as Geo | undefined
  if (!geo) return json({ latitude: null, longitude: null, city: null, country: null })
  return json(
    {
      latitude: geo.latitude ? parseFloat(geo.latitude) : null,
      longitude: geo.longitude ? parseFloat(geo.longitude) : null,
      city: geo.city,
      country: geo.country,
    },
    { headers: { "Cache-Control": cacheHeader({ private: true, maxAge: "1day" }) } },
  )
}
export type IpInfo = SerializeFrom<typeof loader> | undefined
export const shouldRevalidate = () => false

export default function MapView() {
  const clustersFetcher = useFetcher<typeof clustersLoader>()
  const ipInfo = useLoaderData<typeof loader>()
  const preferences = usePreferences()
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
        <ClusterMarker
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
          {preferences.mapLayerRain && <RainRadar />}
          {markers}

          <GeolocateControl position="bottom-right" />
          <NavigationControl position="bottom-right" />
        </Map>
      )}

      <ClientOnly>
        <MapFilters onChange={onParamsChange} />
      </ClientOnly>
      <MapLayers />

      <Outlet />
    </div>
  )
}

interface MarkerProps {
  onClick: (e: mapboxgl.MapboxEvent<MouseEvent>) => void
  point: Cluster
}
function ClusterMarker(props: MarkerProps) {
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
        <SpotMarker spot={props.point.properties as { type: SpotType }} />
      )}
    </Marker>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  const isCatchError = isRouteErrorResponse(error)
  return (
    <div className="space-y-3 p-4">
      <div>
        <h1 className="text-2xl">Oops, something went wrong there!</h1>
        <p>
          There was an error displaying the map, please try again later. We have been notified and are currently working on a fix!
        </p>
      </div>
      {isCatchError ? null : error instanceof Error ? (
        <div className="max-w-4xl space-y-4 rounded-md bg-gray-200 p-4 dark:bg-gray-700 ">
          <p>{error.message}</p>
          <pre className="overflow-scroll text-sm">{error.stack}</pre>
        </div>
      ) : null}
    </div>
  )
}

function RainRadar() {
  // const seriesFetcher = useFetcher()

  // React.useEffect(() => {
  //   seriesFetcher.load("/api/mapbox/weather-series")
  // }, [])

  // const series = seriesFetcher.data

  const [series, setSeries] = React.useState<number | null>(null)
  React.useEffect(() => {
    async function GetData() {
      try {
        const res = await fetch(
          "https://api.weather.com/v3/TileServer/series/productSet/PPAcore?apiKey=d7adbfe03bf54ea0adbfe03bf5fea065",
        )
        const jsonData = await res.json()
        const data = jsonData.seriesInfo.radarEurope.series[0]?.ts as number | undefined
        if (!data) return
        setSeries(data)
      } catch (error) {}
    }
    GetData()
  }, [])

  return (
    <>
      {series ? (
        <>
          <Source
            id="twcRadar"
            type="raster"
            tileSize={256}
            tiles={[
              `https://api.weather.com/v3/TileServer/tile/radarEurope?ts=${series}&xyz={x}:{y}:{z}&apiKey=d7adbfe03bf54ea0adbfe03bf5fea065`,
            ]}
          />
          <Layer type="raster" source="twcRadar" id="radar" paint={{ "raster-opacity": 0.5 }} />
        </>
      ) : undefined}
    </>
  )
}
