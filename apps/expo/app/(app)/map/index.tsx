import * as React from "react"
import { Modal, TouchableOpacity, useColorScheme, View } from "react-native"
import BottomSheet, { useBottomSheetDynamicSnapPoints, useBottomSheetSpringConfigs } from "@gorhom/bottom-sheet"
import Mapbox, { Camera, type MapView as MapType, MarkerView } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { BadgeX, Heart, Navigation, PlusCircle, Settings2, Star, Verified, X } from "lucide-react-native"

import { type SpotType } from "@ramble/database/types"
import { displayRating, INITIAL_LATITUDE, INITIAL_LONGITUDE, useDisclosure } from "@ramble/shared"

import { ImageCarousel } from "../../../components/ui/ImageCarousel"
import { ModalView } from "../../../components/ui/ModalView"
import { Spinner } from "../../../components/ui/Spinner"
import { Text } from "../../../components/ui/Text"
import { toast } from "../../../components/ui/Toast"
import { api, type RouterOutputs } from "../../../lib/api"
import { width } from "../../../lib/device"
import { useAsyncStorage } from "../../../lib/hooks/useAsyncStorage"
import { SPOTS } from "../../../lib/static/spots"
import { useRouter } from "../../router"
import { type Filters, initialFilters, MapFilters } from "./MapFilters"

Mapbox.setAccessToken("pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw")

type Cluster = RouterOutputs["spot"]["clusters"][number]

export function SpotsMapScreen() {
  const { push } = useRouter()
  const [clusters, setClusters] = React.useState<Cluster[] | null>(null)
  const filterModalProps = useDisclosure()
  const [activeSpotId, setActiveSpotId] = React.useState<string | null>(null)
  const [filters, setFilters] = useAsyncStorage<Filters>("ramble.map.filters", initialFilters)
  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)
  const theme = useColorScheme()
  const isDark = theme === "dark"
  const [isFetching, setIsFetching] = React.useState(false)
  const queryClient = api.useContext()

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
            const currentZoom = await mapRef.current?.getZoom()
            camera.current?.setCamera({
              zoomLevel: Math.min((currentZoom || 5) + 2, 14),
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
                className="sq-10 border-primary-100 bg-primary-800 dark:border-primary-700 dark:bg-primary-900 flex items-center justify-center rounded-full border"
              >
                <Text className="text-center text-sm text-white">{point.properties.point_count_abbreviated}</Text>
              </TouchableOpacity>
            </MarkerView>
          )
        } else {
          const spot = point.properties as { type: SpotType; id: string }
          const Icon = SPOTS[spot.type].Icon
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
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPress}
                className="sq-8 bg-primary-600 dark:bg-primary-700 border-primary-100 dark:border-primary-600 z-10 flex items-center justify-center rounded-full border shadow-md"
              >
                <Icon size={20} color="white" />
              </TouchableOpacity>
            </MarkerView>
          )
        }
      }),
    [clusters],
  )
  const filterCount = (filters.isPetFriendly ? 1 : 0) + (filters.isVerified ? 1 : 0) + (filters.types.length > 0 ? 1 : 0)

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

        <Camera
          ref={camera}
          allowUpdates
          defaultSettings={{ centerCoordinate: [INITIAL_LONGITUDE, INITIAL_LATITUDE], zoomLevel: 8 }}
        />
        {markers}
      </Mapbox.MapView>

      {isFetching && !!!clusters && (
        <View className="absolute left-4 top-10 flex items-center justify-center rounded-lg bg-white p-2 dark:bg-gray-800">
          <Spinner />
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => push("NewSpotLayout")}
        style={{ transform: [{ translateX: -26 }] }}
        className="absolute bottom-3 left-1/2 rounded-full bg-gray-800 p-4 dark:bg-white"
      >
        <PlusCircle size={20} className="text-white dark:text-black" />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={filterModalProps.onOpen}
        className="sq-12 absolute bottom-3 left-3 flex flex-row items-center justify-center rounded-full bg-white"
      >
        <Settings2 size={20} className="text-black" />
        {filterCount > 0 && (
          <View className="sq-5 absolute -right-1 -top-1 flex items-center justify-center rounded-full border border-gray-300 bg-white dark:border-gray-700">
            <Text className="text-xs text-black">{filterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSetUserLocation}
        className="sq-12 absolute bottom-3 right-3 flex flex-row items-center justify-center rounded-full bg-white"
      >
        <Navigation size={20} className="text-black" />
      </TouchableOpacity>

      <SpotPreview id={activeSpotId} onClose={() => setActiveSpotId(null)} />
      <Modal
        animationType="slide"
        presentationStyle="formSheet"
        visible={filterModalProps.isOpen}
        onRequestClose={filterModalProps.onClose}
        onDismiss={filterModalProps.onClose}
      >
        <ModalView title="Filters" onBack={filterModalProps.onClose}>
          <MapFilters {...filterModalProps} initialFilters={filters} onSave={onFiltersChange} />
        </ModalView>
      </Modal>
    </View>
  )
}

const SpotPreview = React.memo(function _SpotPreview({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data: spot, isLoading } = api.spot.mapPreview.useQuery({ id: id || "" }, { enabled: !!id, keepPreviousData: true })
  const { push } = useRouter()
  const colorScheme = useColorScheme()

  const bottomSheetRef = React.useRef<BottomSheet>(null)

  const initialSnapPoints = React.useMemo(() => ["CONTENT_HEIGHT"], [])

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(initialSnapPoints)

  const handleSheetClose = React.useCallback(() => {
    bottomSheetRef.current?.close()
    onClose()
  }, [])
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 40,
    overshootClamping: true,
    stiffness: 500,
  })

  return (
    <>
      {isLoading && !!id && (
        <View className="absolute left-4 top-10 flex items-center justify-center rounded-lg bg-white p-2 dark:bg-gray-800">
          <Spinner />
        </View>
      )}
      <BottomSheet
        detached
        animationConfigs={animationConfigs}
        style={{ marginHorizontal: 10 }}
        ref={bottomSheetRef}
        bottomInset={10}
        handleComponent={null}
        index={id ? 0 : -1}
        // enablePanDownToClose
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
      >
        {isLoading ? null : (
          <View onLayout={handleContentLayout} className="rounded-xl bg-white p-4 dark:bg-gray-900">
            {!spot ? (
              <Text>Spot not found</Text>
            ) : (
              <View className="space-y-4">
                <View className="space-y-1">
                  {spot.verifiedAt && spot.verifier ? (
                    <View className="flex flex-row items-center space-x-1 text-sm">
                      <Verified size={16} className="text-black dark:text-white" />
                      <Text>Verified by</Text>
                      <TouchableOpacity onPress={() => push("UserScreen", { username: spot.verifier?.username || "" })}>
                        <Text className="flex flex-row">{`${spot.verifier.firstName} ${spot.verifier.lastName}`}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="flex flex-row items-center space-x-1 text-sm">
                      <BadgeX size={16} className="text-black dark:text-white" />
                      <Text>Unverified</Text>
                    </View>
                  )}

                  <TouchableOpacity onPress={() => push("SpotDetailScreen", { id: spot.id })} activeOpacity={0.7}>
                    <Text numberOfLines={2} className="text-lg leading-6 text-black hover:underline dark:text-white">
                      {spot.name}
                    </Text>
                  </TouchableOpacity>

                  <View className="flex flex-row items-center space-x-2">
                    <View className="flex flex-row items-center space-x-1">
                      <Star size={16} className="text-black dark:text-white" />
                      <Text className="text-sm">{displayRating(spot.rating._avg.rating)}</Text>
                    </View>
                    <View className="flex flex-row flex-wrap items-center space-x-1">
                      <Heart size={16} className="text-black dark:text-white" />
                      <Text className="text-sm">{spot._count.listSpots || 0}</Text>
                    </View>
                  </View>
                </View>
                <View className="overflow-hidden rounded-lg">
                  <ImageCarousel
                    onPress={() => push("SpotDetailScreen", { id: spot.id })}
                    key={spot.id}
                    width={width - 52}
                    height={200}
                    images={spot.images}
                  />
                </View>
              </View>
            )}
            <TouchableOpacity onPress={handleSheetClose} className="absolute right-2 top-2 flex items-center justify-center p-2">
              <X size={24} color={colorScheme === "dark" ? "white" : "black"} />
            </TouchableOpacity>
          </View>
        )}
      </BottomSheet>
    </>
  )
})
