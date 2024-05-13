import { displayRating } from "@ramble/shared"
import { Camera, LocationPuck, type MapState, type MapView as MapType, StyleURL } from "@rnmapbox/maps"
import { keepPreviousData } from "@tanstack/react-query"
import * as Location from "expo-location"
import { Link, useLocalSearchParams, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { Heart, Navigation, Plus, Settings2, Star, X } from "lucide-react-native"
import { usePostHog } from "posthog-react-native"
import * as React from "react"
import { Keyboard, TouchableOpacity, View, useColorScheme } from "react-native"
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated"
import { Icon } from "~/components/Icon"
import { MapView } from "~/components/Map"
import { SpotClusterMarker } from "~/components/SpotMarker"
import { SpotTypeBadge } from "~/components/SpotTypeBadge"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { SpotImageCarousel } from "~/components/ui/SpotImageCarousel"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { isTablet, width } from "~/lib/device"
import { useMapCoords } from "~/lib/hooks/useMapCoords"
import { useMapSettings } from "~/lib/hooks/useMapSettings"
import { useMapFilters } from "../../../../filters"

export default function FindSpotScreen() {
  const filters = useMapFilters((s) => s.filters)

  const initialCoords = useMapCoords((s) => s.coords)

  const [search, setSearch] = React.useState("")

  const [mapSettings, setMapSettings] = useMapSettings()
  const { data: clusters } = api.spot.clusters.useQuery(mapSettings ? { ...mapSettings, ...filters } : undefined, {
    enabled: !!mapSettings,
    placeholderData: keepPreviousData,
  })
  const [isMapLoaded, setIsMapLoaded] = React.useState(false)

  const [activeSpotId, setActiveSpotId] = React.useState<string | null>(null)

  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)

  const { data: places } = api.mapbox.getPlaces.useQuery({ search }, { enabled: !!search, placeholderData: keepPreviousData })

  const handleSetUserLocation = async () => {
    try {
      const loc = await Location.getLastKnownPositionAsync()
      if (!loc) return
      camera.current?.setCamera({
        zoomLevel: 9,
        animationDuration: 0,
        animationMode: "none",
        centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
      })
    } catch {
      console.log("oops -  setting location")
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: dont need to rerender
  React.useEffect(() => {
    if (!isMapLoaded) return
    async function updateMapAfterFiltersChange() {
      try {
        if (!mapRef.current) return
        const properties = await mapRef.current?.getVisibleBounds()
        const zoom = await mapRef.current?.getZoom()
        if (!properties) return
        setMapSettings({
          minLng: properties[1][0],
          minLat: properties[1][1],
          maxLng: properties[0][0],
          maxLat: properties[0][1],
          zoom: zoom || 13,
        })
      } catch {
        toast({ title: "Error fetching spots", type: "error" })
        console.log("oops - fetching clusters on filter")
      }
    }
    updateMapAfterFiltersChange()
  }, [filters, isMapLoaded])

  const onMapMove = ({ properties }: MapState) => {
    if (!properties.bounds) return
    setMapSettings({
      minLng: properties.bounds.sw[0] || 0,
      minLat: properties.bounds.sw[1] || 0,
      maxLng: properties.bounds.ne[0] || 0,
      maxLat: properties.bounds.ne[1] || 0,
      zoom: properties.zoom,
    })
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: dont use activeSpotId
  const spotMarkers = React.useMemo(
    () =>
      clusters?.map((point, i) => (
        <SpotClusterMarker
          point={point}
          key={`${point.id || 0}${i}`}
          onPress={() => {
            camera.current?.setCamera({
              zoomLevel: (point.properties.cluster && point.properties.zoomLevel) || undefined,
              animationMode: "linearTo",
              animationDuration: 300,
              centerCoordinate: point.geometry.coordinates,
              padding: { paddingBottom: activeSpotId ? 345 : 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
            })
            if (!point.properties.cluster) {
              setActiveSpotId(point.properties.id)
            }
          }}
        />
      )),
    [clusters],
  )

  return (
    <ScreenView title="add to trip" containerClassName="px-0">
      <StatusBar style="auto" />

      <View className="relative flex-1">
        <MapView
          className="overflow-hidden rounded-xs"
          onMapIdle={onMapMove}
          onDidFinishLoadingMap={() => setIsMapLoaded(true)}
          ref={mapRef}
          styleURL={StyleURL.SatelliteStreet}
          compassPosition={{ top: 54, right: 8 }}
          onPress={() => setActiveSpotId(null)}
        >
          <LocationPuck />

          <Camera
            ref={camera}
            allowUpdates
            followUserLocation={false}
            defaultSettings={{ zoomLevel: 7, pitch: 0, heading: 0, centerCoordinate: initialCoords }}
          />
          {spotMarkers}
        </MapView>

        <View className="absolute top-2 right-2 left-2">
          <Input
            className="rounded-sm bg-background dark:bg-background-dark"
            placeholder="Search here"
            onChangeText={setSearch}
            value={search}
            clearButtonMode="while-editing"
            returnKeyType="done"
          />
          {search && places && (
            <View className="rounded-b-sm bg-background p-2 dark:bg-background-dark">
              {places.map((place, i) => (
                <TouchableOpacity
                  key={`${place.name}-${i}`}
                  onPress={() => {
                    setSearch("")
                    Keyboard.dismiss()
                    camera.current?.setCamera({
                      zoomLevel: 9,
                      animationDuration: 1000,
                      animationMode: "flyTo",
                      centerCoordinate: place.center,
                    })
                  }}
                  className="p-2"
                >
                  <Text numberOfLines={1}>{place.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View
          pointerEvents="box-none"
          className="absolute right-3 bottom-3 left-3 flex flex-row items-end justify-between space-y-2"
        >
          <Link push href={"/filters/"} asChild>
            <TouchableOpacity
              activeOpacity={0.8}
              className="sq-12 flex flex-row items-center justify-center rounded-full bg-background dark:bg-background-dark"
            >
              <Icon icon={Settings2} size={20} />
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSetUserLocation}
            className="sq-12 flex flex-row items-center justify-center rounded-full bg-background dark:bg-background-dark"
          >
            <Icon icon={Navigation} size={20} />
          </TouchableOpacity>
        </View>

        {activeSpotId && <AddTripSpotPreview spotId={activeSpotId} onClose={() => setActiveSpotId(null)} />}
      </View>
    </ScreenView>
  )
}

export function AddTripSpotPreview({ spotId, onClose }: { spotId: string; onClose: () => void }) {
  const { data: spot, isLoading } = api.spot.mapPreview.useQuery({ id: spotId })
  const router = useRouter()
  const { id, order } = useLocalSearchParams<{ id: string; order?: string }>()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const utils = api.useUtils()
  React.useEffect(() => {
    if (!spot) return
    void utils.spot.detail.prefetch({ id: spot.id })
  }, [spot, utils.spot.detail.prefetch])

  const posthog = usePostHog()
  const { mutate } = api.trip.saveSpot.useMutation({
    onSuccess: (data) => {
      posthog.capture("trip spot created", { spotId: data.spotId })
      void utils.trip.detail.refetch({ id })
      router.back()
    },
  })

  const handleAddToTrip = () => {
    let parsedOrder = order ? Number.parseInt(order) : undefined
    if (!parsedOrder || Number.isNaN(parsedOrder)) parsedOrder = undefined

    mutate({ tripId: id, spotId, order: parsedOrder })
  }

  return (
    <Animated.View
      style={{ width: "100%", position: "absolute", bottom: 0, zIndex: 1 }}
      entering={SlideInDown.duration(200)}
      exiting={SlideOutDown.duration(200)}
      className="rounded-t-xs bg-background p-4 dark:bg-background-dark"
    >
      {isLoading ? (
        <View className="flex items-center justify-center p-10">
          <Spinner />
        </View>
      ) : !spot ? (
        <Text>Spot not found</Text>
      ) : (
        <View className="space-y-2">
          <View className="flex flex-row justify-between">
            <TouchableOpacity onPress={() => router.push(`/(home)/(trips)/spot/${spot.id}`)} activeOpacity={0.9}>
              <SpotTypeBadge spot={spot} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} className="flex items-center justify-center p-1">
              <Icon icon={X} size={22} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push(`/(home)/(trips)/spot/${spot.id}`)}
            activeOpacity={0.7}
            className="flex flex-row items-center space-x-2"
          >
            <Text numberOfLines={1} className="text-lg leading-6">
              {spot.name}
            </Text>
          </TouchableOpacity>
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center space-x-2">
              <View className="flex flex-row flex-wrap items-center space-x-1">
                <Icon icon={Heart} size={16} fill={isDark ? "white" : "black"} />
                <Text className="text-sm">{spot._count.listSpots || 0}</Text>
              </View>
              <View className="flex flex-row items-center space-x-1">
                <Icon icon={Star} size={16} fill={isDark ? "white" : "black"} />
                <Text className="text-sm">{displayRating(spot.rating._avg.rating)}</Text>
              </View>
            </View>

            <View className="flex flex-row space-x-2">
              <Button
                size="xs"
                onPress={handleAddToTrip}
                leftIcon={<Icon icon={Plus} color={{ dark: "black", light: "white" }} size={16} />}
              >
                Add to Trip
              </Button>
            </View>
          </View>

          <View className="overflow-hidden rounded-xs">
            <SpotImageCarousel
              canAddMore
              spot={spot}
              onPress={() => router.push(`/(home)/(trips)/spot/${spot.id}`)}
              key={spot.id} // so images reload
              width={width - 32}
              height={180}
              noOfColumns={isTablet ? 2 : 1}
              images={spot.images}
            />
          </View>
        </View>
      )}
    </Animated.View>
  )
}
