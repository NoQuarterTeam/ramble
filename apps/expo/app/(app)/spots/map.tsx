import * as React from "react"
import { Modal, ScrollView, Switch, TouchableOpacity, useColorScheme, View } from "react-native"
import BottomSheet, { useBottomSheetDynamicSnapPoints, useBottomSheetSpringConfigs } from "@gorhom/bottom-sheet"
import Mapbox, { Camera, type MapView as MapType, MarkerView } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { BadgeCheck, BadgeX, Dog, List, Navigation, Settings2, Star, Verified, X } from "lucide-react-native"

import { type SpotType } from "@ramble/database/types"
import { INITIAL_LATITUDE, INITIAL_LONGITUDE, join, useDisclosure } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Button } from "../../../components/ui/Button"
import { Heading } from "../../../components/ui/Heading"
import { ImageCarousel } from "../../../components/ui/ImageCarousel"
import { ModalView } from "../../../components/ui/ModalView"
import { Spinner } from "../../../components/ui/Spinner"
import { Text } from "../../../components/ui/Text"
import { api, type RouterOutputs } from "../../../lib/api"
import { width } from "../../../lib/device"
import { SPOT_OPTIONS, SPOTS } from "../../../lib/spots"
import { useRouter } from "../../router"

Mapbox.setAccessToken("pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw")

type Cluster = RouterOutputs["spot"]["clusters"][number]

type Filters = {
  isPetFriendly: boolean
  isVerified: boolean
  types: SpotType[]
}

const initialFilters: Filters = {
  isPetFriendly: false,
  isVerified: false,
  types: [],
}

export function SpotsMapScreen() {
  const { push } = useRouter()
  const [location, setLocation] = React.useState<Location.LocationObjectCoords | null>(null)
  const [clusters, setClusters] = React.useState<Cluster[] | null>(null)
  const filterModalProps = useDisclosure()
  const [activeSpotId, setActiveSpotId] = React.useState<string | null>(null)
  const [filters, setFilters] = React.useState<Filters>(initialFilters)
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
        const loc = await Location.getCurrentPositionAsync()
        setLocation(loc.coords)
      } catch {
        console.log("oops -  getting location")
      }
    })()
  }, [])

  const onFiltersChange = async (f: Filters) => {
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
        className="flex-1"
        logoEnabled={false}
        compassEnabled
        onMapIdle={onMapMove}
        onPress={() => setActiveSpotId(null)}
        ref={mapRef}
        // pitchEnabled={false}
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
          defaultSettings={{
            centerCoordinate: [location?.longitude || INITIAL_LONGITUDE, location?.latitude || INITIAL_LATITUDE],
            zoomLevel: 8,
          }}
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
        onPress={() => push("SpotsScreen")}
        className="absolute bottom-3 left-1/2 -ml-[50px] flex w-[100px] flex-row items-center justify-center space-x-2 rounded-full bg-gray-800 p-3 dark:bg-white"
      >
        <List size={20} className="text-white dark:text-black" />
        <Text className="text-white dark:text-black">Latest</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={filterModalProps.onOpen}
        className="absolute bottom-3 left-3 flex flex-row items-center justify-center rounded-full bg-white p-3"
      >
        <Settings2 size={20} className="text-black" />
        {filterCount > 0 && (
          <View className="sq-5 absolute -right-1 -top-1 flex items-center justify-center rounded-full border border-gray-300 bg-white dark:border-gray-700">
            <Text className="text-xs text-black">{filterCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      {!!location && (
        <TouchableOpacity
          onPress={() => camera.current?.moveTo([location.longitude, location.latitude])}
          className="absolute bottom-3 right-3 flex flex-row items-center justify-center rounded-full bg-white p-3"
        >
          <Navigation size={20} className="text-black" />
        </TouchableOpacity>
      )}

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
                    <TouchableOpacity onPress={() => push("UsernameLayout", { username: spot.verifier?.username || "" })}>
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

                <View className="flex flex-row flex-wrap items-center space-x-1">
                  <Star size={16} className="text-black dark:text-white" />
                  <Text className="text-sm">{spot.rating._avg.rating?.toFixed(1) || "Not rated"}</Text>
                  <Text>·</Text>
                  <Text className="text-sm">
                    {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
                  </Text>
                </View>
              </View>
              <View className="overflow-hidden rounded-lg">
                <ImageCarousel key={spot.id} width={width - 52} height={200} images={spot.images} />
              </View>
            </View>
          )}
          <TouchableOpacity onPress={handleSheetClose} className="absolute right-2 top-2 flex items-center justify-center p-2">
            <X size={24} color={colorScheme === "dark" ? "white" : "black"} />
          </TouchableOpacity>
        </View>
      )}
    </BottomSheet>
  )
})

interface Props {
  initialFilters: Filters
  onSave: (filters: Filters) => void
}

export function MapFilters(props: Props) {
  const [filters, setFilters] = React.useState(props.initialFilters)
  return (
    <View className="flex-1 pb-10 pt-4">
      <ScrollView className="space-y-5">
        <View className="space-y-1">
          <Heading className="font-400 text-2xl">Spot type</Heading>
          <View className="flex flex-row flex-wrap gap-2">
            {SPOT_OPTIONS.map((type) => {
              const isSelected = filters.types.includes(type.value)
              return (
                <Button
                  variant={isSelected ? "primary" : "outline"}
                  leftIcon={
                    <type.Icon
                      size={20}
                      className={join(isSelected ? "text-white dark:text-black" : "text-black dark:text-white")}
                    />
                  }
                  key={type.value}
                  onPress={() =>
                    setFilters((f) => ({
                      ...f,
                      types: isSelected ? f.types.filter((t) => t !== type.value) : [...f.types, type.value],
                    }))
                  }
                >
                  {type.label}
                </Button>
              )
            })}
          </View>
        </View>

        <View className="space-y-2">
          <Heading className="font-400 text-2xl">Options</Heading>
          <View className="flex flex-row items-center justify-between space-x-4">
            <View className="flex flex-row items-center space-x-4">
              <BadgeCheck size={30} className="text-black dark:text-white" />
              <View>
                <Text className="text-lg">Verified spots</Text>
                <Text className="text-sm opacity-75">Spots verified by an Ambassador</Text>
              </View>
            </View>
            <Switch
              trackColor={{ true: colors.primary[600] }}
              value={filters.isVerified}
              onValueChange={() => setFilters((f) => ({ ...f, isVerified: !f.isVerified }))}
            />
          </View>
          <View className="flex flex-row items-center justify-between space-x-4">
            <View className="flex flex-row items-center space-x-4">
              <Dog size={30} className="text-black dark:text-white" />
              <View>
                <Text className="text-lg">Pet friendly</Text>
                <Text className="text-sm opacity-75">Furry friends allowed</Text>
              </View>
            </View>
            <Switch
              trackColor={{ true: colors.primary[600] }}
              value={filters.isPetFriendly}
              onValueChange={() => setFilters((f) => ({ ...f, isPetFriendly: !f.isPetFriendly }))}
            />
          </View>
        </View>
      </ScrollView>
      <View className="flex flex-row justify-between">
        <Button variant="link" onPress={() => props.onSave(initialFilters)}>
          Clear all
        </Button>
        <Button className="w-[120px]" onPress={() => props.onSave(filters)}>
          Save filters
        </Button>
      </View>
    </View>
  )
}
