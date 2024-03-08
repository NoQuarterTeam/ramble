import { cssBundleHref } from "@remix-run/css-bundle"
import {
  Outlet,
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useNavigate,
  useRouteError,
  useSearchParams,
} from "@remix-run/react"
import center from "@turf/center"
import { type Feature, type Point, points } from "@turf/helpers"
import type { Geo } from "@vercel/edge"
import { geolocation } from "@vercel/edge"
import { User } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"
import queryString from "query-string"
import * as React from "react"
import { Layer, type LngLatLike, type MapRef, Marker, Source, type ViewStateChangeEvent } from "react-map-gl"
import type { MarkerEvent, MarkerInstance } from "react-map-gl/dist/esm/types"
import { ClientOnly } from "remix-utils/client-only"

import { INITIAL_LATITUDE, INITIAL_LONGITUDE, createImageUrl, join } from "@ramble/shared"

import { MapView } from "~/components/Map"
import { OptimizedImage } from "~/components/OptimisedImage"
import { db } from "~/lib/db.server"
import { useMapLayers } from "~/lib/hooks/useMapLayers"
import type { LinksFunction, LoaderFunctionArgs, SerializeFrom } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { MapFilters } from "~/pages/_main+/_app+/components/MapFilters"
import type { UserCluster, userClustersLoader } from "~/pages/api+/user-clusters"
import { getUserSession } from "~/services/session/session.server"

import { useTheme } from "~/lib/theme"
import type { clustersLoader } from "../../api+/clusters"
import { MapLayerControls } from "./components/MapLayerControls"
import { MapSearch } from "./components/MapSearch"
import { SpotClusterMarker } from "./components/SpotMarker"

export const config = {
  // runtime: "edge",
}

export const links: LinksFunction = () => {
  return cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const geo = geolocation(request) as Geo | undefined
  const { userId } = await getUserSession(request)
  if (!geo) return json({ latitude: null, longitude: null, city: null, country: null })

  if (userId && geo.latitude && geo.longitude) {
    const randomVariant = Math.random() * (0.03 - 0.02) + 0.02 * (Math.random() > 0.5 ? 1 : -1)
    await db.user.update({
      where: { id: userId },
      data: { latitude: Number(geo.latitude) + randomVariant, longitude: Number(geo.longitude) + randomVariant },
    })
  }
  return json(
    {
      latitude: geo.latitude ? Number.parseFloat(geo.latitude) : null,
      longitude: geo.longitude ? Number.parseFloat(geo.longitude) : null,
      city: geo.city,
      country: geo.country,
    },
    { headers: { "Cache-Control": cacheHeader({ private: true, maxAge: "1day" }) } },
  )
}
export type IpInfo = SerializeFrom<typeof loader> | undefined
export const shouldRevalidate = () => false

export default function MapRouter() {
  const clustersFetcher = useFetcher<typeof clustersLoader>()
  const userClustersFetcher = useFetcher<typeof userClustersLoader>()
  const ipInfo = useLoaderData<typeof loader>()
  const clusters = clustersFetcher.data
  const userClusters = userClustersFetcher.data

  const mapRef = React.useRef<MapRef>(null)

  const [searchParams] = useSearchParams()
  // biome-ignore lint/correctness/useExhaustiveDependencies: allow
  const initialViewState = React.useMemo(() => {
    const zoom = searchParams.get("zoom")
    const minLat = searchParams.get("minLat")
    const maxLat = searchParams.get("maxLat")
    const minLng = searchParams.get("minLng")
    const maxLng = searchParams.get("maxLng")
    let centerFromParams: Feature<Point> | undefined
    if (minLat && maxLat && minLng && maxLng) {
      centerFromParams = center(
        points([
          [Number.parseFloat(minLng), Number.parseFloat(minLat)],
          [Number.parseFloat(maxLng), Number.parseFloat(maxLat)],
        ]),
      )
    }

    return {
      zoom: zoom ? Number.parseInt(zoom) : ipInfo ? 6 : 5,
      longitude: centerFromParams?.geometry.coordinates[0] || ipInfo?.longitude || INITIAL_LONGITUDE,
      latitude: centerFromParams?.geometry.coordinates[1] || ipInfo?.latitude || INITIAL_LATITUDE,
    }
  }, [ipInfo])

  const onParamsChange = (params: string) => {
    const parsed = queryString.parse(params, { arrayFormat: "bracket" })
    const type = parsed.type
    const formatted = queryString.stringify(
      {
        ...parsed,
        type: !type || type.length === 0 ? ["CAMPING", "FREE_CAMPING", "REWILDING"] : type === "none" ? undefined : type,
      },
      { arrayFormat: "bracket" },
    )
    const formattedSearch = queryString.stringify(
      { ...parsed, type: !type ? ["CAMPING", "FREE_CAMPING", "REWILDING"] : type },
      { arrayFormat: "bracket" },
    )

    clustersFetcher.load(`/api/clusters?${formatted}`)
    userClustersFetcher.load(`/api/user-clusters?${formatted}`)
    window.history.replaceState(null, "", `${window.location.pathname}?${formattedSearch}`)
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: allow
  const markers = React.useMemo(
    () =>
      clusters?.map((point, i) => (
        <SpotClusterMarker
          point={point}
          key={`${point.id || 0}-${i}`}
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            if (!point.properties.cluster && point.properties.id) {
              navigate(`/map/${point.properties.id}${window.location.search}`)
            }
            const zoom = point.properties.cluster ? Math.min(point.properties.zoomLevel, 20) : mapRef.current?.getZoom()
            const center = point.geometry.coordinates as LngLatLike
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

    [clusters],
  )
  const mapLayers = useMapLayers()

  // biome-ignore lint/correctness/useExhaustiveDependencies: allow
  const userMarkers = React.useMemo(
    () =>
      mapLayers.shouldShowUsers &&
      userClusters?.map((point, i) => (
        <UserClusterMarker
          point={point}
          key={`${point.id || 0}-${i}`}
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            if (!point.properties.cluster) {
              navigate(`/${point.properties.username}`)
            } else {
              const zoom = Math.min(point.properties.zoomLevel, 20)
              const center = point.geometry.coordinates as LngLatLike
              mapRef.current?.flyTo({ center, duration: 1000, padding: 50, zoom })
            }
          }}
        />
      )),
    [userClusters, mapLayers.shouldShowUsers],
  )

  const isDark = useTheme() === "dark"

  return (
    <div className="relative h-nav-screen w-screen overflow-hidden">
      <MapView
        onLoad={onMove}
        onMoveEnd={onMove}
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={
          mapLayers.layer === "satellite"
            ? "mapbox://styles/mapbox/satellite-streets-v12"
            : mapLayers.layer === "temp" || mapLayers.layer === "rain"
              ? `mapbox://styles/mapbox/${isDark ? "dark" : "light"}-v11`
              : undefined
        }
      >
        <MapLayers />
        {markers}
        {userMarkers}
      </MapView>

      <ClientOnly>{() => <MapFilters onChange={onParamsChange} />}</ClientOnly>
      <MapLayerControls />
      <MapSearch onSearch={(center) => mapRef.current?.flyTo({ center })} />
      <Outlet />
    </div>
  )
}

interface UserMarkerProps {
  onClick: (e: MarkerEvent<MarkerInstance, MouseEvent>) => void
  point: UserCluster
}
function UserClusterMarker(props: UserMarkerProps) {
  return (
    <Marker
      onClick={props.onClick}
      anchor="bottom"
      longitude={props.point.geometry.coordinates[0]!}
      latitude={props.point.geometry.coordinates[1]!}
    >
      {props.point.properties.cluster ? (
        <div
          className={join(
            "center cursor-pointer rounded-full border border-purple-100 bg-purple-700 text-white shadow transition-transform hover:scale-110",
            props.point.properties.point_count > 150
              ? "sq-20"
              : props.point.properties.point_count > 75
                ? "sq-16"
                : props.point.properties.point_count > 10
                  ? "sq-12"
                  : "sq-8",
          )}
        >
          <p className="text-center text-sm">{props.point.properties.point_count_abbreviated}</p>
        </div>
      ) : (
        <div className="center sq-10 group relative cursor-pointer rounded-full border border-purple-100 bg-purple-500 shadow transition-transform hover:scale-110">
          {props.point.properties.avatar ? (
            <OptimizedImage
              width={50}
              alt="user location"
              height={50}
              placeholder={props.point.properties.avatarBlurHash}
              src={createImageUrl(props.point.properties.avatar)}
              className="sq-10 rounded-full object-cover"
            />
          ) : (
            <User size={18} className="text-white" />
          )}
          <div className="-bottom-5 -translate-x-1/2 absolute left-1/2 hidden rounded-xs bg-background px-2 py-1 group-hover:block">
            <p className="text-xs">{props.point.properties.username}</p>
          </div>
        </div>
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
        <div className="max-w-4xl space-y-4 rounded-xs bg-gray-200 p-4 dark:bg-gray-700">
          <p>{error.message}</p>
          <pre className="overflow-scroll text-sm">{error.stack}</pre>
        </div>
      ) : null}
    </div>
  )
}

function MapLayers() {
  const mapLayers = useMapLayers()
  return (
    <>
      {mapLayers.layer === "temp" && (
        <>
          <Source
            id="temp"
            type="raster"
            tileSize={256}
            tiles={["https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=0937eef5e79a9078196f43c47db32b63"]}
          />
          <Layer id="tempLayer" source="temp" type="raster" />
          <div className="absolute right-12 bottom-2.5 hidden items-center space-x-4 rounded-xs bg-background px-2 py-1 text-xs shadow sm:flex">
            <p>Temperature, °C</p>
            <div>
              <div className="flex w-full justify-between">
                <p>-40</p>
                <p>-20</p>
                <p>0</p>
                <p>20</p>
                <p>40</p>
              </div>
              <div
                className="h-[4px] w-[260px] rounded-xs"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgb(159, 85, 181) 0%, rgb(44, 106, 187) 8.75%, rgb(82, 139, 213) 12.5%, rgb(103, 163, 222) 18.75%, rgb(142, 202, 240) 25%, rgb(155, 213, 244) 31.25%, rgb(172, 225, 253) 37.5%, rgb(194, 234, 255) 43.75%, rgb(255, 255, 208) 50%, rgb(254, 248, 174) 56.25%, rgb(254, 232, 146) 62.5%, rgb(254, 226, 112) 68.75%, rgb(253, 212, 97) 75%, rgb(244, 168, 94) 82.5%, rgb(244, 129, 89) 87.5%, rgb(244, 104, 89) 93.75%, rgb(244, 76, 73) 100%)",
                }}
              />
            </div>
          </div>
        </>
      )}
      {mapLayers.layer === "rain" && (
        <>
          <Source
            id="rain"
            type="raster"
            tileSize={256}
            tiles={[
              "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=0937eef5e79a9078196f43c47db32b63",
            ]}
          />
          <Layer id="rainLayer" source="rain" type="raster" />
        </>
      )}
    </>
  )
}
