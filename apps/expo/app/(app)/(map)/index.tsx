import { type SpotType } from "@ramble/database/types"
import { INITIAL_LATITUDE, INITIAL_LONGITUDE, useDisclosure } from "@ramble/shared"
import Mapbox, { Camera, MarkerView, type MapView as MapType } from "@rnmapbox/maps"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { BadgeX, List, Navigation, Settings2, Star, Verified, X } from "lucide-react-native"
import * as React from "react"
import { Modal, ScrollView, Switch, TouchableOpacity, View, useColorScheme } from "react-native"
import { Link } from "../../../components/Link"
import { ModalView } from "../../../components/ModalView"
import { Text } from "../../../components/Text"
import { api, type RouterOutputs } from "../../../lib/api"
import { SPOTS, SPOT_OPTIONS } from "../../../lib/spots"
import colors from "@ramble/tailwind-config/src/colors"
import { Button } from "../../../components/Button"
import { Heading } from "../../../components/Heading"

Mapbox.setAccessToken("pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw")

type Cluster = RouterOutputs["spot"]["clusters"][number]

type Filters = {
  isPetFriendly: boolean
  isVerified: boolean
  isVanFriendly: boolean
  types: SpotType[]
}

const initialFilters: Filters = {
  isPetFriendly: false,
  isVerified: false,
  isVanFriendly: false,
  types: [],
}

export default function MapScreen() {
  const router = useRouter()
  const [clusters, setClusters] = React.useState<Cluster[]>([])
  const filterModalProps = useDisclosure()
  const [activeSpotId, setActiveSpotId] = React.useState<string | null>(null)
  const [filters, setFilters] = React.useState<Filters>(initialFilters)
  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)
  const theme = useColorScheme()
  const isDark = theme === "dark"
  const queryClient = api.useContext()
  const onMapMove = async ({ properties }: Mapbox.MapState) => {
    try {
      // todo: filters
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
      console.log("oops")
    }
  }

  const markers = React.useMemo(
    () =>
      clusters.map((point, i) => {
        if (point.properties.cluster) {
          return (
            <MarkerView key={i} coordinate={point.geometry.coordinates}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={async () => {
                  const currentZoom = await mapRef.current?.getZoom()
                  camera.current?.setCamera({
                    zoomLevel: Math.min((currentZoom || 5) + 2, 14),
                    animationMode: "linearTo",
                    animationDuration: 300,
                    centerCoordinate: point.geometry.coordinates,
                    padding: { paddingBottom: activeSpotId ? 300 : 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
                  })
                }}
                className="sq-10 border-primary-100 bg-primary-800 dark:border-primary-700 dark:bg-primary-900 flex items-center justify-center rounded-full border"
              >
                <Text className="text-center text-sm text-white">{point.properties.point_count_abbreviated}</Text>
              </TouchableOpacity>
            </MarkerView>
          )
        } else {
          const spot = point.properties as { type: SpotType; id: string }
          const Icon = SPOTS[spot.type].Icon
          return (
            <MarkerView key={spot.id} coordinate={point.geometry.coordinates}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setActiveSpotId(spot.id)
                  camera.current?.setCamera({
                    animationMode: "linearTo",
                    animationDuration: 300,
                    centerCoordinate: point.geometry.coordinates,
                    padding: { paddingBottom: 300, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
                  })
                }}
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
  return (
    <View className="flex-1">
      <Mapbox.MapView
        className="flex-1"
        logoEnabled={false}
        compassEnabled
        onMapIdle={onMapMove}
        onPress={() => setActiveSpotId(null)}
        ref={mapRef}
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
          // followUserLocation
          defaultSettings={{ centerCoordinate: [INITIAL_LONGITUDE, INITIAL_LATITUDE], zoomLevel: 8 }}
        />
        {markers}
      </Mapbox.MapView>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("(map)/latest")}
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
      </TouchableOpacity>
      <TouchableOpacity
        // onPress={() => router.push("(map)/latest")}
        className="absolute bottom-3 right-3 flex flex-row items-center justify-center rounded-full bg-white p-3"
      >
        <Navigation size={20} className="text-black" />
      </TouchableOpacity>

      {activeSpotId && <SpotPreview id={activeSpotId} onClose={() => setActiveSpotId(null)} />}
      <Modal
        animationType="slide"
        presentationStyle="formSheet"
        visible={filterModalProps.isOpen}
        onRequestClose={filterModalProps.onClose}
        onDismiss={filterModalProps.onClose}
      >
        <ModalView title="Filters" onBack={filterModalProps.onClose}>
          <MapFilters
            {...filterModalProps}
            initialFilters={filters}
            onSave={(f) => {
              filterModalProps.onClose()
              setFilters(f)
            }}
          />
        </ModalView>
      </Modal>
    </View>
  )
}

const SpotPreview = React.memo(function _SpotPreview({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: spot, isLoading } = api.spot.byId.useQuery({ id }, { keepPreviousData: true })
  const colorScheme = useColorScheme()
  if (isLoading && !spot) return null
  return (
    <View className="absolute bottom-2 left-2 right-2 rounded-xl bg-white p-5 dark:bg-gray-900">
      {!spot ? (
        <Text>Spot not found</Text>
      ) : (
        <View className="space-y-4">
          <View className="space-y-1">
            {spot.verifiedAt && spot.verifier ? (
              <View className="flex flex-row items-center space-x-1 text-sm">
                <Verified size={16} className="text-black dark:text-white" />
                <Text>Verified by</Text>
                <Link href={`/${spot.verifier.username}`} className="flex flex-row hover:underline">
                  {`${spot.verifier.firstName} ${spot.verifier.lastName}`}
                </Link>
              </View>
            ) : (
              <View className="flex flex-row items-center space-x-1 text-sm">
                <BadgeX size={16} className="text-black dark:text-white" />
                <Text>Unverified</Text>
              </View>
            )}
            <Link
              numberOfLines={2}
              href={`/spots/${spot.id}`}
              className="text-lg leading-6 text-black hover:underline dark:text-white"
            >
              {spot.name}
            </Link>
            <View className="flex flex-row flex-wrap items-center space-x-1 text-sm">
              <Star size={16} className="text-black dark:text-white" />

              {/* <Text>{rating._avg.rating?.toFixed(1) || "Not rated"}</Text>} */}
              <Text>{5 || "Not rated"}</Text>

              <Text>·</Text>
              <Text>
                {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
              </Text>
            </View>
          </View>
          <ScrollView horizontal className="space-x-1" bounces snapToAlignment="start">
            {spot.images.map((image) => (
              <Image key={image.id} source={{ uri: image.path }} className="h-[200px] w-[300px] rounded-md object-cover" />
            ))}
          </ScrollView>
        </View>
      )}
      <TouchableOpacity onPress={onClose} className="absolute right-2 top-2 flex items-center justify-center p-2">
        <X size={24} color={colorScheme === "dark" ? "white" : "black"} />
      </TouchableOpacity>
    </View>
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
      <ScrollView className="space-y-4">
        <View className="space-y-1">
          <Heading className="text-xl">Spot type</Heading>
          <View className="flex flex-row flex-wrap gap-2">
            {SPOT_OPTIONS.map((type) => (
              <Button
                variant={filters.types.includes(type.value) ? "primary" : "outline"}
                size="lg"
                leftIcon={<type.Icon size={20} className="text-black dark:text-white" />}
                key={type.value}
                // onPress={() => setIsSelected((s) => !s)}
              >
                {type.label}
              </Button>
            ))}
          </View>
        </View>

        <View className="space-y-1">
          <Heading className="text-xl">Options</Heading>
          <View className="flex flex-row items-center space-x-4">
            <Text>Pet friendly</Text>
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
          Save
        </Button>
      </View>
    </View>
  )
}
