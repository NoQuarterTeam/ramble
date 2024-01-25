import {
  Camera,
  MarkerView,
  RasterLayer,
  RasterSource,
  UserLocation,
  type MapState,
  type MapView as MapType,
} from "@rnmapbox/maps"
import * as Location from "expo-location"
import { Link, useRouter } from "expo-router"
import { Layers, Navigation, PlusCircle, Settings2, User } from "lucide-react-native"
import * as React from "react"
import { TouchableOpacity, useColorScheme, View } from "react-native"

import { createImageUrl, INITIAL_LATITUDE, INITIAL_LONGITUDE, join } from "@ramble/shared"

import { FeedbackCheck } from "~/components/FeedbackCheck"
import { Icon } from "~/components/Icon"
import { Map } from "~/components/Map"
import { RegisterCheck } from "~/components/RegisterCheck"
import { SpotClusterMarker } from "~/components/SpotMarker"

import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api, type RouterOutputs } from "~/lib/api"
import { isAndroid } from "~/lib/device"

import { useMe } from "~/lib/hooks/useMe"

import { MapSearch } from "~/components/MapSearch"
import { SpotPreview } from "~/components/SpotPreview"
import { useMapLayers } from "./layers"
import { useMapFilters } from "./filters"

type Cluster = RouterOutputs["spot"]["clusters"][number]
type UserCluster = RouterOutputs["user"]["clusters"][number]

export default function MapScreen() {
  const router = useRouter()
  const { me } = useMe()
  const layers = useMapLayers((s) => s.layers)
  const isDark = useColorScheme() === "dark"
  const [clusters, setClusters] = React.useState<Cluster[] | null>(null)

  const [activeSpotId, setActiveSpotId] = React.useState<string | null>(null)
  const filters = useMapFilters((s) => s.filters)
  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)
  const [isFetching, setIsFetching] = React.useState(false)
  const utils = api.useUtils()

  const [isLoaded, setIsLoaded] = React.useState(false)
  const [users, setUsers] = React.useState<UserCluster[] | null>(null)

  const { mutate: updateUser } = api.user.update.useMutation()

  const handleSetUserLocation = async () => {
    try {
      setIsLoaded(true)
      const loc = await Location.getLastKnownPositionAsync()
      if (!loc) return
      camera.current?.setCamera({
        animationDuration: 0,
        animationMode: "none",
        centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
      })
      if (!me) return
      const randomVariant = Math.random() * (0.03 - 0.02) + 0.02 * (Math.random() > 0.5 ? 1 : -1)
      updateUser({
        latitude: Number(loc.coords.latitude) + randomVariant,
        longitude: Number(loc.coords.longitude) + randomVariant,
      })
    } catch {
      console.log("oops -  setting location")
    }
  }

  React.useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") return
      } catch {
        console.log("oops -  getting location")
      }
    })()
  }, [])

  React.useEffect(() => {
    if (!isLoaded) return
    async function updateMapAfterFiltersChange() {
      try {
        if (!mapRef.current) return
        const properties = await mapRef.current?.getVisibleBounds()
        const zoom = await mapRef.current?.getZoom()
        if (!properties) return
        const input = {
          ...filters,
          minLng: properties[1][0],
          minLat: properties[1][1],
          maxLng: properties[0][0],
          maxLat: properties[0][1],
          zoom: zoom || 13,
        }
        const data = await utils.spot.clusters.fetch(input)
        setClusters(data)
      } catch {
        toast({ title: "Error fetching spots", type: "error" })
        console.log("oops - fetching clusters on filter")
      }
    }
    updateMapAfterFiltersChange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isLoaded])

  const onMapMove = async ({ properties }: MapState) => {
    try {
      setIsFetching(true)
      if (!properties.bounds) return
      const input = {
        ...filters,
        minLng: properties.bounds.sw[0] || 0,
        minLat: properties.bounds.sw[1] || 0,
        maxLng: properties.bounds.ne[0] || 0,
        maxLat: properties.bounds.ne[1] || 0,
        zoom: properties.zoom,
      }

      void utils.spot.clusters.fetch(input).then(setClusters)
      if (layers.shouldShowUsers && me) {
        void utils.user.clusters.fetch(input).then(setUsers)
      }
    } catch {
      toast({ title: "Error fetching spots", type: "error" })
      console.log("oops - fetching clusters on map move")
    } finally {
      setIsFetching(false)
    }
  }

  const spotMarkers = React.useMemo(
    () =>
      clusters?.map((point, i) => (
        <SpotClusterMarker
          point={point}
          key={i}
          onPress={() => {
            camera.current?.setCamera({
              zoomLevel: (point.properties.cluster && point.properties.zoomLevel) || undefined,
              animationMode: "linearTo",
              animationDuration: 300,
              centerCoordinate: point.geometry.coordinates,
              padding: { paddingBottom: activeSpotId ? 430 : 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
            })
            if (!point.properties.cluster) {
              setActiveSpotId(point.properties.id)
            }
          }}
        />
      )),
    // dont add activeSpotId here
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clusters],
  )
  const userMarkers = React.useMemo(
    () =>
      layers.shouldShowUsers &&
      users?.map((point, i) => {
        if (point.properties.cluster) {
          const onPress = async () => {
            camera.current?.setCamera({
              zoomLevel: (point.properties.cluster && point.properties.zoomLevel) || undefined,
              animationMode: "linearTo",
              animationDuration: 300,
              centerCoordinate: point.geometry.coordinates,
              padding: { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
            })
          }
          return (
            <MarkerView key={i} coordinate={point.geometry.coordinates}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPress}
                className={join(
                  "flex items-center justify-center rounded-full border border-purple-100 bg-purple-700",
                  point.properties.point_count > 150
                    ? "sq-20"
                    : point.properties.point_count > 75
                      ? "sq-16"
                      : point.properties.point_count > 10
                        ? "sq-12"
                        : "sq-8",
                )}
              >
                <Text className="text-center text-sm text-white">{point.properties.point_count_abbreviated}</Text>
              </TouchableOpacity>
            </MarkerView>
          )
        } else {
          const user = point.properties as {
            cluster: false
            username: string
            id: string
            avatar: string | null
            avatarBlurHash: string | null
          }
          const onPress = () => {
            router.push(`/(home)/(map)/${user.username}/(profile)`)
          }
          return (
            <MarkerView key={user.id} coordinate={point.geometry.coordinates}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPress}
                className="sq-8 flex items-center justify-center overflow-hidden rounded-full border border-purple-100 bg-purple-500"
              >
                {user.avatar ? (
                  <OptimizedImage
                    width={50}
                    height={50}
                    placeholder={user.avatarBlurHash}
                    style={{ width: 32, height: 32 }}
                    source={{ uri: createImageUrl(user.avatar) }}
                    className=" object-cover"
                  />
                ) : (
                  <Icon icon={User} size={16} color="white" />
                )}
              </TouchableOpacity>
            </MarkerView>
          )
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users, layers.shouldShowUsers],
  )
  // const filterCount = (filters.isPetFriendly ? 1 : 0) + (filters.isUnverified ? 1 : 0) + (filters.types.length > 0 ? 1 : 0)

  return (
    <View className="flex-1">
      <RegisterCheck />
      <FeedbackCheck />
      <Map
        onLayout={handleSetUserLocation}
        onMapIdle={onMapMove}
        onPress={() => setActiveSpotId(null)}
        ref={mapRef}
        styleURL={
          layers.layer === "rain" || layers.layer === "temp"
            ? `mapbox://styles/mapbox/${isDark ? "dark" : "light"}-v11`
            : layers.layer === "satellite"
              ? "mapbox://styles/mapbox/satellite-streets-v12"
              : undefined
        }
      >
        <UserLocation />

        <MapLayers />
        <Camera
          ref={camera}
          allowUpdates
          defaultSettings={{ centerCoordinate: [INITIAL_LONGITUDE, INITIAL_LATITUDE], zoomLevel: 8, pitch: 0, heading: 0 }}
        />

        {spotMarkers}
        {userMarkers}
      </Map>

      {((isAndroid && isFetching) || (!isAndroid && isFetching && !!!clusters)) && (
        <View
          pointerEvents="none"
          className="absolute right-4 top-14 flex flex-col items-center justify-center rounded-full bg-white p-2 dark:bg-gray-800"
        >
          <Spinner />
        </View>
      )}

      <MapSearch
        onSearch={(center) => {
          camera.current?.setCamera({ animationDuration: 600, zoomLevel: 14, centerCoordinate: center })
        }}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("/new/")}
        style={{ transform: [{ translateX: -26 }] }}
        className="bg-primary absolute bottom-3 left-1/2 rounded-full p-4 "
      >
        <Icon icon={PlusCircle} size={20} color="white" />
      </TouchableOpacity>

      <View pointerEvents="box-none" className="absolute bottom-3 left-3 flex space-y-2">
        <Link push href={`/layers`} asChild>
          <TouchableOpacity
            activeOpacity={0.8}
            className="sq-12 bg-background dark:bg-background-dark flex flex-row items-center justify-center rounded-full"
          >
            <Icon icon={Layers} size={20} />
            {/* {Object.values(layers).filter(Boolean).length > 0 && (
              <View className="sq-5 bg-background dark:bg-background-dark absolute -right-1 -top-1 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700">
                <Text className="text-xs">{Object.values(layers).filter(Boolean).length}</Text>
              </View>
            )} */}
          </TouchableOpacity>
        </Link>
        <Link push href={`/filters`} asChild>
          <TouchableOpacity
            activeOpacity={0.8}
            className="sq-12 bg-background dark:bg-background-dark flex flex-row items-center justify-center rounded-full"
          >
            <Icon icon={Settings2} size={20} />
            {/* {filterCount > 0 && (
              <View className="sq-5 bg-background dark:bg-background-dark absolute -right-1 -top-1 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700">
                <Text className="text-xs ">{filterCount}</Text>
              </View>
            )} */}
          </TouchableOpacity>
        </Link>
      </View>

      <TouchableOpacity
        onPress={handleSetUserLocation}
        className="sq-12 bg-background dark:bg-background-dark absolute bottom-3 right-3 flex flex-row items-center justify-center rounded-full"
      >
        <Icon icon={Navigation} size={20} />
      </TouchableOpacity>

      {activeSpotId && <SpotPreview id={activeSpotId} onClose={() => setActiveSpotId(null)} />}
    </View>
  )
}

function MapLayers() {
  const layers = useMapLayers((s) => s.layers)

  return (
    <>
      <RasterSource
        id="temp"
        tileSize={256}
        tileUrlTemplates={[`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=0937eef5e79a9078196f43c47db32b63`]}
      />
      {layers.layer === "temp" && <RasterLayer id="tempLayer" sourceID="temp" style={{ rasterOpacity: 1 }} />}

      <RasterSource
        id="rain"
        tileSize={256}
        tileUrlTemplates={[
          `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=0937eef5e79a9078196f43c47db32b63`,
        ]}
      />
      {layers.layer === "rain" && <RasterLayer id="rainLayer" sourceID="rain" style={{ rasterOpacity: 1 }} />}
    </>
  )
}
