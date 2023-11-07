import * as React from "react"
import { Modal, Switch, TouchableOpacity, useColorScheme, View } from "react-native"
import Mapbox, { Camera, type MapView as MapType, MarkerView, RasterLayer, RasterSource } from "@rnmapbox/maps"
import { useQuery } from "@tanstack/react-query"
import * as Location from "expo-location"
import { CloudRain, Layers, Navigation, PlusCircle, Settings2 } from "lucide-react-native"

import { type SpotType } from "@ramble/database/types"
import { INITIAL_LATITUDE, INITIAL_LONGITUDE, join, useDisclosure } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "../../../components/Icon"
import { SpotMarker } from "../../../components/SpotMarker"
import { ModalView } from "../../../components/ui/ModalView"
import { Spinner } from "../../../components/ui/Spinner"
import { Text } from "../../../components/ui/Text"
import { toast } from "../../../components/ui/Toast"
import { api, type RouterOutputs } from "../../../lib/api"
import { useAsyncStorage } from "../../../lib/hooks/useAsyncStorage"
import { usePreferences } from "../../../lib/hooks/usePreferences"
import { useRouter } from "../../router"
import { type Filters, initialFilters, MapFilters } from "./MapFilters"
import { SpotPreview } from "./SpotPreview"
import { useMe } from "../../../lib/hooks/useMe"

Mapbox.setAccessToken("pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw")

type Cluster = RouterOutputs["spot"]["clusters"][number]

export function SpotsMapScreen() {
  const { push } = useRouter()
  const { me } = useMe()
  const [clusters, setClusters] = React.useState<Cluster[] | null>(null)
  const filterModalProps = useDisclosure()
  const mapLayerModalProps = useDisclosure()
  const [activeSpotId, setActiveSpotId] = React.useState<string | null>(null)
  const [filters, setFilters] = useAsyncStorage<Filters>("ramble.map.filters", {
    ...initialFilters,
    types: [
      "CAMPING",
      "FREE_CAMPING",
      me?.isMountainBiker ? "MOUNTAIN_BIKING" : null,
      me?.isClimber ? "CLIMBING" : null,
      me?.isHiker ? "HIKING_TRAIL" : null,
      me?.isSurfer ? "SURFING" : null,
      me?.isPaddleBoarder ? "PADDLE_KAYAK" : null,
    ].filter(Boolean) as SpotType[],
  })
  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)
  const theme = useColorScheme()
  const isDark = theme === "dark"
  const [isFetching, setIsFetching] = React.useState(false)
  const queryClient = api.useUtils()

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
  }, [])

  const handleSetUserLocation = async () => {
    try {
      const loc = await Location.getLastKnownPositionAsync()
      if (!loc) return
      camera.current?.setCamera({
        animationDuration: 0,
        animationMode: "none",
        centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
      })
    } catch {
      console.log("oops -  setting location")
    }
  }
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
      const data = await queryClient.spot.clusters.fetch(input)
      setClusters(data)
    } catch {
      toast({ title: "Error fetching spots", type: "error" })
      console.log("oops - fetching clusters on filter")
    }
  }

  const onMapMove = async ({ properties }: Mapbox.MapState) => {
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
      const data = await queryClient.spot.clusters.fetch(input)
      setClusters(data)
    } catch {
      toast({ title: "Error fetching spots", type: "error" })
      console.log("oops - fetching clusters on map move")
    } finally {
      setIsFetching(false)
    }
  }

  const markers = React.useMemo(
    () =>
      clusters?.map((point, i) => {
        if (point.properties.cluster) {
          const onPress = async () => {
            camera.current?.setCamera({
              zoomLevel: (point.properties.cluster && point.properties.zoomLevel) || undefined,
              animationMode: "linearTo",
              animationDuration: 300,
              centerCoordinate: point.geometry.coordinates,
              padding: { paddingBottom: activeSpotId ? 300 : 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
            })
          }
          return (
            <MarkerView key={i} coordinate={point.geometry.coordinates}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPress}
                className={join(
                  "border-primary-100 bg-primary-700 flex items-center justify-center rounded-full border",
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
          const spot = point.properties as { type: SpotType; id: string }
          const onPress = () => {
            camera.current?.setCamera({
              animationMode: "linearTo",
              animationDuration: 300,
              centerCoordinate: point.geometry.coordinates,
              padding: { paddingBottom: 300, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
            })
            setActiveSpotId(spot.id)
          }
          return (
            <MarkerView key={spot.id} coordinate={point.geometry.coordinates}>
              <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
                <SpotMarker spot={spot} />
              </TouchableOpacity>
            </MarkerView>
          )
        }
      }),
    // activeSpotId breaks here
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clusters],
  )
  const filterCount = (filters.isPetFriendly ? 1 : 0) + (filters.isUnverified ? 1 : 0) + (filters.types.length > 0 ? 1 : 0)

  const [preferences, setPreferences, isReady] = usePreferences()
  return (
    <View className="flex-1">
      <Mapbox.MapView
        onLayout={handleSetUserLocation}
        className="flex-1"
        logoEnabled={false}
        compassEnabled
        onMapIdle={onMapMove}
        onPress={() => setActiveSpotId(null)}
        ref={mapRef}
        pitchEnabled={false}
        compassFadeWhenNorth
        scaleBarEnabled={false}
        styleURL={
          isDark ? "mapbox://styles/jclackett/clh82otfi00ay01r5bftedls1" : "mapbox://styles/jclackett/clh82jh0q00b601pp2jfl30sh"
        }
      >
        <Mapbox.UserLocation />

        <RainRadar shouldRender={isReady && preferences.mapLayerRain} />
        <Camera
          ref={camera}
          allowUpdates
          defaultSettings={{ centerCoordinate: [INITIAL_LONGITUDE, INITIAL_LATITUDE], zoomLevel: 8 }}
        />

        {markers}
      </Mapbox.MapView>

      {isFetching && !!!clusters && (
        <View className="absolute left-4 top-10 flex flex-col items-center justify-center rounded-full bg-white p-2 dark:bg-gray-800">
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

      <View className="absolute bottom-3 left-3 flex space-y-2">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={mapLayerModalProps.onOpen}
          className="sq-12 bg-background flex flex-row items-center justify-center rounded-full"
        >
          <Icon icon={Layers} size={20} color="black" />
          {preferences.mapLayerRain && (
            <View className="sq-5 bg-background absolute -right-1 -top-1 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700">
              <Text className="text-xs text-black">{1}</Text>
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

      <SpotPreview id={activeSpotId} onClose={() => setActiveSpotId(null)} />
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
              <View className="flex flex-row items-center space-x-4">
                <Icon icon={CloudRain} size={30} />
                <View>
                  <Text className="text-lg">Rain</Text>
                  <Text numberOfLines={2} className="max-w-[200px] text-sm opacity-75">
                    Shows the current rain radar over europe
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{ true: colors.primary[600] }}
                value={preferences.mapLayerRain}
                onValueChange={() => setPreferences({ ...preferences, mapLayerRain: !preferences.mapLayerRain })}
              />
            </View>
            <Text>More coming soon!</Text>
          </View>
        </ModalView>
      </Modal>
    </View>
  )
}

function RainRadar({ shouldRender }: { shouldRender: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ["rainRadar"],
    queryFn: async () => {
      const res = await fetch(
        "https://api.weather.com/v3/TileServer/series/productSet/PPAcore?apiKey=d7adbfe03bf54ea0adbfe03bf5fea065",
      )
      const jsonData = await res.json()
      const data = jsonData.seriesInfo.radarEurope.series[0]?.ts as number | undefined
      return data
    },
    keepPreviousData: true,
    refetchInterval: 1000 * 60 * 5,
  })
  if (!data || isLoading) return null

  return (
    <>
      <RasterSource
        id="twcRadar"
        tileSize={256}
        tileUrlTemplates={[
          `https://api.weather.com/v3/TileServer/tile/radarEurope?ts=${data}&xyz={x}:{y}:{z}&apiKey=d7adbfe03bf54ea0adbfe03bf5fea065`,
        ]}
      />
      <RasterLayer sourceID="twcRadar" id="radar" style={{ visibility: shouldRender ? "visible" : "none", rasterOpacity: 0.4 }} />
    </>
  )
}
