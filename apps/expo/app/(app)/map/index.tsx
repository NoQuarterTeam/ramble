import * as React from "react"
import { Modal, Switch, TouchableOpacity, View } from "react-native"
import {
  Camera,
  type MapState,
  type MapView as MapType,
  MarkerView,
  RasterLayer,
  RasterSource,
  UserLocation,
} from "@rnmapbox/maps"
import { useQuery } from "@tanstack/react-query"
import * as Location from "expo-location"
import { CloudRain, Layers, MountainSnow, Navigation, PlusCircle, Settings2, User, Users2 } from "lucide-react-native"
import * as Sentry from "sentry-expo"

import { type SpotType } from "@ramble/database/types"
import { createImageUrl, INITIAL_LATITUDE, INITIAL_LONGITUDE, join, useDisclosure } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { FeedbackCheck } from "../../../components/FeedbackCheck"
import { Icon } from "../../../components/Icon"
import { Map } from "../../../components/Map"
import { RegisterCheck } from "../../../components/RegisterCheck"
import { SpotClusterMarker } from "../../../components/SpotMarker"
import { ModalView } from "../../../components/ui/ModalView"
import { Spinner } from "../../../components/ui/Spinner"
import { Text } from "../../../components/ui/Text"
import { toast } from "../../../components/ui/Toast"
import { api, type RouterOutputs } from "../../../lib/api"
import { useAsyncStorage } from "../../../lib/hooks/useAsyncStorage"
import { useMe } from "../../../lib/hooks/useMe"
import { usePreferences } from "../../../lib/hooks/usePreferences"
import { useRouter } from "../../router"
import { type Filters, initialFilters, MapFilters } from "./MapFilters"
import { SpotPreview } from "./SpotPreview"
import { isAndroid } from "../../../lib/device"
import { OptimizedImage } from "../../../components/ui/OptimisedImage"

type Cluster = RouterOutputs["spot"]["clusters"][number]
type UserCluster = RouterOutputs["user"]["clusters"][number]

export function MapScreen() {
  const { push } = useRouter()
  const { me } = useMe()
  const [preferences, setPreferences, isReady] = usePreferences()

  const [clusters, setClusters] = React.useState<Cluster[] | null>(null)
  const filterModalProps = useDisclosure()
  const mapLayerModalProps = useDisclosure()
  const [activeSpotId, setActiveSpotId] = React.useState<string | null>(null)
  const [filters, setFilters] = useAsyncStorage<Filters>("ramble.map.filters", {
    ...initialFilters,
    types: [
      "CAMPING",
      "FREE_CAMPING",
      "REWILDING",
      me?.isMountainBiker ? "MOUNTAIN_BIKING" : null,
      me?.isClimber ? "CLIMBING" : null,
      me?.isHiker ? "HIKING_TRAIL" : null,
      me?.isSurfer ? "SURFING" : null,
      me?.isPaddleBoarder ? "PADDLE_KAYAK" : null,
    ].filter(Boolean) as SpotType[],
  })
  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)
  const [isFetching, setIsFetching] = React.useState(false)
  const utils = api.useUtils()

  const [users, setUsers] = React.useState<UserCluster[] | null>(null)

  const { mutate: updateUser } = api.user.update.useMutation()

  const handleSetUserLocation = React.useCallback(async () => {
    try {
      const loc = await Location.getLastKnownPositionAsync()
      if (!loc) return
      camera.current?.setCamera({
        animationDuration: 0,
        animationMode: "none",
        centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
      })
      if (!me) return
      const randomVariant = Math.random() * (0.02 - 0.001) + 0.001 * (Math.random() > 0.5 ? 1 : -1)
      updateUser({
        latitude: Number(loc.coords.latitude) + randomVariant,
        longitude: Number(loc.coords.longitude) + randomVariant,
      })
    } catch {
      console.log("oops -  setting location")
    }
  }, [updateUser, me])

  React.useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") return
        await handleSetUserLocation()
      } catch {
        console.log("oops -  getting location")
      }
    })()
  }, [handleSetUserLocation])

  const onFiltersChange = async (f: Filters) => {
    try {
      filterModalProps.onClose()
      setFilters(f)
      const properties = await mapRef.current?.getVisibleBounds()
      const zoom = await mapRef.current?.getZoom()
      if (!properties) return
      const input = {
        ...f,
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
      if (preferences.mapUsers && me) {
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
      preferences.mapUsers &&
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
            push("UserScreen", { username: user.username })
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
    [users, preferences.mapUsers],
  )
  const filterCount = (filters.isPetFriendly ? 1 : 0) + (filters.isUnverified ? 1 : 0) + (filters.types.length > 0 ? 1 : 0)

  return (
    <View className="flex-1">
      <RegisterCheck />
      <FeedbackCheck />
      <Map onLayout={handleSetUserLocation} onMapIdle={onMapMove} onPress={() => setActiveSpotId(null)} ref={mapRef}>
        <UserLocation />

        <RainRadar shouldRender={isReady && preferences.mapLayerRain} />
        <Camera
          ref={camera}
          allowUpdates
          defaultSettings={{ centerCoordinate: [INITIAL_LONGITUDE, INITIAL_LATITUDE], zoomLevel: 8 }}
        />

        {spotMarkers}
        {userMarkers}
      </Map>

      {((isAndroid && isFetching) || (!isAndroid && isFetching && !!!clusters)) && (
        <View
          pointerEvents="none"
          className="absolute left-4 top-10 flex flex-col items-center justify-center rounded-full bg-white p-2 dark:bg-gray-800"
        >
          <Spinner />
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => push("NewSpotLayout")}
        style={{ transform: [{ translateX: -26 }] }}
        className="bg-primary absolute bottom-3 left-1/2 rounded-full p-4 "
      >
        <Icon icon={PlusCircle} size={20} color="white" />
      </TouchableOpacity>

      <View pointerEvents="box-none" className="absolute bottom-3 left-3 flex space-y-2">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={mapLayerModalProps.onOpen}
          className="sq-12 bg-background flex flex-row items-center justify-center rounded-full"
        >
          <Icon icon={Layers} size={20} color="black" />
          {Object.values(preferences).filter(Boolean).length > 0 && (
            <View className="sq-5 bg-background absolute -right-1 -top-1 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700">
              <Text className="text-xs text-black">{Object.values(preferences).filter(Boolean).length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={filterModalProps.onOpen}
          className="sq-12 bg-background flex flex-row items-center justify-center rounded-full"
        >
          <Icon icon={Settings2} size={20} color="black" />
          {filterCount > 0 && (
            <View className="sq-5 bg-background absolute -right-1 -top-1 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700">
              <Text className="text-xs text-black">{filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSetUserLocation}
        className="sq-12 bg-background absolute bottom-3 right-3 flex flex-row items-center justify-center rounded-full"
      >
        <Icon icon={Navigation} size={20} color="black" />
      </TouchableOpacity>

      {activeSpotId && <SpotPreview id={activeSpotId} onClose={() => setActiveSpotId(null)} />}
      <Modal
        animationType="slide"
        presentationStyle="formSheet"
        visible={filterModalProps.isOpen}
        onRequestClose={filterModalProps.onClose}
        onDismiss={filterModalProps.onClose}
      >
        <ModalView title="filters" onBack={filterModalProps.onClose}>
          <MapFilters {...filterModalProps} initialFilters={filters} onSave={onFiltersChange} />
        </ModalView>
      </Modal>
      <Modal
        animationType="slide"
        presentationStyle="formSheet"
        visible={mapLayerModalProps.isOpen}
        onRequestClose={mapLayerModalProps.onClose}
        onDismiss={mapLayerModalProps.onClose}
      >
        <ModalView title="map layers" onBack={mapLayerModalProps.onClose}>
          <View className="space-y-2">
            <View className="flex flex-row items-center justify-between space-x-2">
              <View className="flex flex-row items-center space-x-3">
                <Icon icon={CloudRain} size={30} />
                <View>
                  <Text className="h-[25px] text-lg">Rain</Text>
                  <Text numberOfLines={2} style={{ lineHeight: 16 }} className="max-w-[220px] text-sm opacity-75">
                    Shows the current european rain radar
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{ true: colors.primary[600] }}
                value={preferences.mapLayerRain}
                onValueChange={() => setPreferences({ ...preferences, mapLayerRain: !preferences.mapLayerRain })}
              />
            </View>
            <View className="flex flex-row items-center justify-between space-x-2">
              <View className="flex flex-row items-center space-x-3">
                <Icon icon={MountainSnow} size={30} />
                <View>
                  <Text className="h-[25px] text-lg">Satellite view</Text>
                  <Text numberOfLines={2} style={{ lineHeight: 16 }} className="max-w-[220px] text-sm opacity-75">
                    Changes the map to satellite view
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{ true: colors.primary[600] }}
                value={preferences.mapStyleSatellite}
                onValueChange={() => setPreferences({ ...preferences, mapStyleSatellite: !preferences.mapStyleSatellite })}
              />
            </View>
            {me && (
              <View className="flex flex-row items-center justify-between space-x-2">
                <View className="flex flex-row items-center space-x-3">
                  <Icon icon={Users2} size={30} />
                  <View>
                    <Text className="h-[25px] text-lg">Ramble users</Text>
                    <Text numberOfLines={2} style={{ lineHeight: 16 }} className="max-w-[220px] text-sm opacity-75">
                      See the approximate location of other Ramble users
                    </Text>
                  </View>
                </View>
                <Switch
                  trackColor={{ true: colors.primary[600] }}
                  value={preferences.mapUsers}
                  onValueChange={() => setPreferences({ ...preferences, mapUsers: !preferences.mapUsers })}
                />
              </View>
            )}
            <Text className="pt-6">More coming soon!</Text>
          </View>
        </ModalView>
      </Modal>
    </View>
  )
}

function RainRadar({ shouldRender }: { shouldRender: boolean }) {
  const { data } = useQuery({
    queryKey: ["rainRadar"],
    queryFn: async () => {
      try {
        const res = await fetch(
          "https://api.weather.com/v3/TileServer/series/productSet/PPAcore?apiKey=d7adbfe03bf54ea0adbfe03bf5fea065",
        )
        const jsonData = await res.json()
        const data = jsonData.seriesInfo.radarEurope.series[0]?.ts as number | undefined
        return data
      } catch (error) {
        Sentry.Native.captureException(error)
      }
    },
    enabled: shouldRender,
    staleTime: Infinity,
    cacheTime: Infinity,
    keepPreviousData: true,
    refetchInterval: 1000 * 60 * 5,
  })
  if (!data) return null

  return (
    <>
      <RasterSource
        id="twcRadar"
        tileSize={256}
        tileUrlTemplates={[
          `https://api.weather.com/v3/TileServer/tile/radarEurope?ts=${data}&xyz={x}:{y}:{z}&apiKey=d7adbfe03bf54ea0adbfe03bf5fea065`,
        ]}
      />
      <RasterLayer sourceID="twcRadar" id="radar" style={{ rasterOpacity: 0.4 }} />
    </>
  )
}
