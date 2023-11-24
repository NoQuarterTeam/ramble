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
import { type MarkerEvent, type MarkerInstance } from "react-map-gl/dist/esm/types"
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
import center from "@turf/center"
import { points } from "@turf/helpers"
import type { Geo } from "@vercel/edge"
import { geolocation } from "@vercel/edge"
import { User } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"
import queryString from "query-string"

import { ClientOnly, createImageUrl, INITIAL_LATITUDE, INITIAL_LONGITUDE, join } from "@ramble/shared"

import { OptimizedImage } from "~/components/OptimisedImage"
import { db } from "~/lib/db.server"
import { usePreferences } from "~/lib/hooks/usePreferences"
import { useTheme } from "~/lib/theme"
import type { LinksFunction, LoaderFunctionArgs, SerializeFrom } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { MapFilters } from "~/pages/_main+/_app+/components/MapFilters"
import { type UserCluster, type userClustersLoader } from "~/pages/api+/user-clusters"
import { getUserSession } from "~/services/session/session.server"

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
    const randomVariant = Math.random() * (0.02 - 0.001) + 0.001 * (Math.random() > 0.5 ? 1 : -1)
    await db.user.update({
      where: { id: userId },
      data: {
        latitude: Number(geo.latitude) + randomVariant,
        longitude: Number(geo.longitude) + randomVariant,
      },
    })
  }
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
  const userClustersFetcher = useFetcher<typeof userClustersLoader>()
  const ipInfo = useLoaderData<typeof loader>()
  const clusters = clustersFetcher.data
  const userClusters = userClustersFetcher.data

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
      centerFromParams = center(
        points([
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

  const markers = React.useMemo(
    () =>
      clusters?.map((point, i) => (
        <SpotClusterMarker
          point={point}
          key={i}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clusters],
  )
  const preferences = usePreferences()

  const userMarkers = React.useMemo(
    () =>
      preferences.mapUsers &&
      userClusters?.map((point, i) => (
        <UserClusterMarker
          point={point}
          key={i}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userClusters, preferences.mapUsers],
  )
  const noMap = searchParams.get("noMap")

  // React.useEffect(() => {
  //   if (mapRef.current) {
  //     console.log("stufffff")
  //     console.log(mapRef.current)
  //     console.log("done")
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore
  //     mapRef.current.setConfigProperty("basemap", "lightPreset", theme === "light" ? "day" : "night")
  //   }
  // }, [theme])

  return (
    <div className="h-nav-screen relative w-screen overflow-hidden">
      {!noMap && (
        <Map
          mapboxAccessToken="pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw"
          onLoad={(e) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // e.target.setConfigProperty("basemap", "lightPreset", theme === "light" ? "day" : "dusk")
            onMove(e)
          }}
          onMoveEnd={onMove}
          ref={mapRef}
          maxZoom={20}
          style={{ height: "100%", width: "100%" }}
          initialViewState={initialViewState}
          attributionControl={false}
          mapStyle={
            preferences.mapStyleSatellite
              ? "mapbox://styles/jclackett/clp122bar007z01qu21kc8h4g"
              : theme === "dark"
                ? "mapbox://styles/jclackett/clh82otfi00ay01r5bftedls1"
                : "mapbox://styles/jclackett/clh82jh0q00b601pp2jfl30sh"
          }
          // mapStyle={"mapbox://styles/mapbox/standard-beta"}
        >
          <MapLayers />
          {markers}
          {userMarkers}
          <GeolocateControl position="bottom-right" />
          <NavigationControl position="bottom-right" />
        </Map>
      )}

      <ClientOnly>
        <MapFilters onChange={onParamsChange} />
      </ClientOnly>
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
          <div className="bg-background rounded-xs absolute -bottom-5 left-1/2 hidden -translate-x-1/2 px-2 py-1 group-hover:block">
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
        <div className="rounded-xs max-w-4xl space-y-4 bg-gray-200 p-4 dark:bg-gray-700 ">
          <p>{error.message}</p>
          <pre className="overflow-scroll text-sm">{error.stack}</pre>
        </div>
      ) : null}
    </div>
  )
}

function MapLayers() {
  const preferences = usePreferences()
  const [rainData, setRainData] = React.useState<number | undefined>(undefined)
  React.useEffect(() => {
    if (preferences.mapLayerRain) {
      async function getData() {
        try {
          const res = await fetch(
            "https://api.weather.com/v3/TileServer/series/productSet/PPAcore?apiKey=d7adbfe03bf54ea0adbfe03bf5fea065",
          )
          const jsonData = await res.json()
          const data = jsonData.seriesInfo.radarEurope.series[0]?.ts as number | undefined
          setRainData(data)
        } catch (error) {
          console.log(error)
        }
      }
      getData()
    }
  }, [preferences.mapLayerRain])

  return (
    <>
      {preferences.mapLayerTemp && (
        <>
          <Source
            id="temp"
            type="raster"
            tileSize={256}
            tiles={[`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=0937eef5e79a9078196f43c47db32b63`]}
          />
          <Layer
            id="tempLayer"
            source="temp"
            type="raster"
            // paint={{
            //   "raster-scaling": "lanczos",
            //   "raster-colorizer-default-mode": "linear",
            //   "raster-colorizer-default-color": "transparent",
            //   "raster-colorizer-stops": `
            //     stop(0, rgba(225, 200, 100, 0))
            //     stop(0.1, rgba(200, 150, 150, 0))
            //     stop(0.2, rgba(150, 150, 170, 0))
            //     stop(0.5, rgba(120, 120, 190, 0))
            //     stop(1, rgba(210, 110, 205, 0.3))
            //     stop(10, rgba(20,80, 225, 0.7))
            //     stop(140, rgba(200, 20, 255, 0.9))
            //   `,
            // }}
          />
          <div className="bg-background rounded-xs absolute right-20 top-4 flex items-center space-x-4 px-2 py-1 text-xs shadow">
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
                className="rounded-xs h-[4px] w-[260px]"
                style={{
                  backgroundImage: `linear-gradient(to right, rgb(159, 85, 181) 0%, rgb(44, 106, 187) 8.75%, rgb(82, 139, 213) 12.5%, rgb(103, 163, 222) 18.75%, rgb(142, 202, 240) 25%, rgb(155, 213, 244) 31.25%, rgb(172, 225, 253) 37.5%, rgb(194, 234, 255) 43.75%, rgb(255, 255, 208) 50%, rgb(254, 248, 174) 56.25%, rgb(254, 232, 146) 62.5%, rgb(254, 226, 112) 68.75%, rgb(253, 212, 97) 75%, rgb(244, 168, 94) 82.5%, rgb(244, 129, 89) 87.5%, rgb(244, 104, 89) 93.75%, rgb(244, 76, 73) 100%)`,
                }}
              ></div>
            </div>
          </div>
        </>
      )}
      {preferences.mapLayerRain && rainData && (
        <>
          <Source
            id="rain"
            type="raster"
            tileSize={256}
            tiles={[
              `https://api.weather.com/v3/TileServer/tile/radarEurope?ts=${rainData}&xyz={x}:{y}:{z}&apiKey=d7adbfe03bf54ea0adbfe03bf5fea065`,
            ]}
          />
          <Layer type="raster" source="rain" id="rainLayer" />
        </>
      )}
    </>
  )
}
