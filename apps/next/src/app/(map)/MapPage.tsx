"use client"
import { MapView } from "@/components/Map"
import { SpotClusterMarker } from "@/components/SpotMarker"
import { useMapSettings } from "@/lib/hooks/useMapSettings"
import { type RouterOutputs, api } from "@/lib/trpc/react"
import { createAssetUrl, join } from "@ramble/shared"
import { keepPreviousData } from "@tanstack/react-query"
import { User } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import * as React from "react"
import { type LngLatLike, type MapRef, Marker, type ViewStateChangeEvent } from "react-map-gl"
import type { MarkerEvent, MarkerInstance } from "react-map-gl/dist/esm/types"
import { MapFilters } from "./components/MapFilters"
import { MapLayerControls } from "./components/MapLayerControls"
import { MapSearch } from "./components/MapSearch"

export function MapPage() {
  const mapRef = React.useRef<MapRef>(null)

  const [mapSettings, setMapSettings] = useMapSettings()

  const onMove = (e: mapboxgl.MapboxEvent<undefined> | ViewStateChangeEvent) => {
    const bounds = e.target.getBounds()
    const zoom = Math.round(e.target.getZoom())

    setMapSettings({
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLng: bounds.getWest(),
      maxLng: bounds.getEast(),
      zoom,
    })
  }

  const { data } = api.spot.clusters.useQuery(mapSettings ? { ...mapSettings, types: ["CAMPING", "VAN_PARK"] } : undefined, {
    enabled: !!mapSettings,
    placeholderData: keepPreviousData,
  })
  const { data: userData } = api.user.clusters.useQuery(mapSettings || undefined, {
    enabled: !!mapSettings,
    placeholderData: keepPreviousData,
  })

  const router = useRouter()

  // biome-ignore lint/correctness/useExhaustiveDependencies: allow
  const spotMarkers = React.useMemo(
    () =>
      data?.map((point, i) => (
        <SpotClusterMarker
          point={point}
          key={`${point.id || 0}${i}`}
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            if (!point.properties.cluster && point.properties.id) {
              router.push(`/map/${point.properties.id}`)
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
    [data],
  )

  const userMarkers = React.useMemo(
    () =>
      userData?.map((point, i) => (
        <UserClusterMarker
          point={point}
          key={`${point.id || 0}-${i}`}
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            if (!point.properties.cluster) {
              // navigate(`/${point.properties.username}`)
            } else {
              const zoom = Math.min(point.properties.zoomLevel, 20)
              const center = point.geometry.coordinates as LngLatLike
              mapRef.current?.flyTo({ center, duration: 1000, padding: 50, zoom })
            }
          }}
        />
      )),
    [userData],
  )

  return (
    <div className="h-full w-full">
      <MapView
        ref={mapRef}
        onLoad={onMove}
        onMoveEnd={onMove}
        initialViewState={{ latitude: 46, longitude: 2, zoom: 4.5, pitch: 0 }}
      >
        {spotMarkers}
        {userMarkers}
      </MapView>

      <MapLayerControls />
      <MapFilters />
      <MapSearch onSearch={(center) => mapRef.current?.flyTo({ center })} />
    </div>
  )
}

interface UserMarkerProps {
  onClick: (e: MarkerEvent<MarkerInstance, MouseEvent>) => void
  point: RouterOutputs["user"]["clusters"][number]
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
            "flex items-center justify-center cursor-pointer rounded-full border border-primary-100 bg-primary-700 text-white shadow transition-transform hover:scale-110",
            props.point.properties.point_count > 150
              ? "h-20 w-20"
              : props.point.properties.point_count > 75
                ? "h-16 w-16"
                : props.point.properties.point_count > 10
                  ? "h-12 w-12"
                  : "h-8 w-8",
          )}
        >
          <p className="text-center text-sm">{props.point.properties.point_count_abbreviated}</p>
        </div>
      ) : (
        <div className="flex items-center justify-center w-10 h-10 group relative cursor-pointer rounded-full border border-primary-200 bg-primary-700 shadow transition-transform hover:scale-110">
          {props.point.properties.avatar ? (
            <Image
              width={50}
              height={50}
              alt="user location"
              // placeholder={props.point.properties.avatarBlurHash}
              src={createAssetUrl(props.point.properties.avatar)}
              className="sq-10 rounded-full object-cover"
            />
          ) : (
            <User size={18} className="text-white" />
          )}
          <div className="-bottom-5 -translate-x-1/2 absolute left-1/2 hidden rounded-xs bg-background px-2 py-1 group-hover:block">
            <p className="text-xs whitespace-nowrap">{props.point.properties.username}</p>
          </div>
        </div>
      )}
    </Marker>
  )
}
