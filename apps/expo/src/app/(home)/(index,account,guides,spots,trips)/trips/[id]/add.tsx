import * as React from "react"
import { Keyboard, TouchableOpacity, useColorScheme, View } from "react-native"
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated"
import { Camera, type MapState, type MapView as MapType, StyleURL, LocationPuck } from "@rnmapbox/maps"
import { type Position } from "@rnmapbox/maps/lib/typescript/src/types/Position"
import * as Location from "expo-location"
import { Link, useLocalSearchParams, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { AlertTriangle, CircleDot, Heart, MapPinned, Navigation, Plus, PlusCircle, Settings2, Star, X } from "lucide-react-native"
import { usePostHog } from "posthog-react-native"

import { displayRating, join } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { Map } from "~/components/Map"
import { SpotClusterMarker } from "~/components/SpotMarker"
import { SpotTypeBadge } from "~/components/SpotTypeBadge"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { SpotImageCarousel } from "~/components/ui/SpotImageCarousel"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api, type RouterOutputs } from "~/lib/api"
import { isTablet, width } from "~/lib/device"
import { useMapCoords } from "~/lib/hooks/useMapCoords"

import { useMapFilters } from "../../../../filters"

type Cluster = RouterOutputs["spot"]["clusters"][number]

export default function NewItemScreen() {
  const router = useRouter()
  const { id, order } = useLocalSearchParams<{ id: string; order?: string }>()
  const filters = useMapFilters((s) => s.filters)

  const initialCoords = useMapCoords((s) => s.coords)
  const [coords, setCoords] = React.useState<Position | undefined>(initialCoords)

  const [search, setSearch] = React.useState("")

  const [clusters, setClusters] = React.useState<Cluster[] | null>(null)
  const [activeSpotId, setActiveSpotId] = React.useState<string | null>(null)

  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)
  const utils = api.useUtils()

  const [isLoaded, setIsLoaded] = React.useState(false)
  const {
    data: geocodeData,
    isLoading: addressLoading,
    isFetching,
  } = api.mapbox.geocodeCoords.useQuery(
    { latitude: coords?.[1]!, longitude: coords?.[0]! },
    { enabled: !!coords?.[0] && !!coords?.[1], keepPreviousData: true },
  )
  const isUnknownAddress = !!!geocodeData?.place

  const { data: places } = api.mapbox.getPlaces.useQuery({ search }, { enabled: !!search, keepPreviousData: true })

  const handleSetUserLocation = async () => {
    setIsLoaded(true)
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

  const onMapMove = ({ properties }: MapState) => {
    try {
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
      setCoords(properties.center)
    } catch {
      toast({ title: "Error fetching spots", type: "error" })
      console.log("oops - fetching clusters on map move")
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
              padding: { paddingBottom: activeSpotId ? 345 : 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
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

  const posthog = usePostHog()
  const { mutate, isLoading: createLoading } = api.trip.saveStop.useMutation({
    onSuccess: (data) => {
      posthog?.capture("trip stop created", { place: data.name })
      void utils.trip.detail.refetch({ id })
      router.back()
    },
  })

  const handleCreateTripStop = () => {
    if (!geocodeData?.place) return
    if (!coords) return toast({ title: "Please select a location" })
    mutate({
      tripId: id,
      name: geocodeData.place,
      latitude: coords[1]!,
      longitude: coords[0]!,
      order: order ? Number(order) : undefined,
    })
  }

  return (
    <ScreenView title="add to trip" containerClassName="px-0">
      {/* <Text className="px-2">Add a location, an existing spot, or create a new one to save to your trip</Text> */}
      <StatusBar style="auto" />
      <View className="flex w-full flex-row items-center justify-between space-x-1 overflow-hidden px-2 pb-2">
        <View className="flex-1 flex-row items-center space-x-1">
          {addressLoading || isFetching ? (
            <Spinner size="small" />
          ) : (
            <Icon
              icon={isUnknownAddress ? AlertTriangle : MapPinned}
              size={20}
              color={isUnknownAddress ? "primary" : undefined}
              className={join(!!!isUnknownAddress && "opacity-80")}
            />
          )}
          <Text numberOfLines={1} className="flex-1 text-sm opacity-70">
            {addressLoading ? "" : geocodeData?.place || "Unknown address - move map to set"}
          </Text>
        </View>
        <Button
          size="xs"
          onPress={() => {
            if (!coords || !geocodeData || isUnknownAddress) return
            if (!coords[0] || !coords[1]) return toast({ title: "Please select a location" })
            handleCreateTripStop()
          }}
          disabled={!coords || (coords && (!coords[0] || !coords[1])) || !geocodeData || isUnknownAddress}
          isLoading={createLoading}
        >
          Add to trip
        </Button>
      </View>

      <View className="relative flex-1">
        <Map
          className="rounded-xs overflow-hidden"
          onMapIdle={onMapMove}
          ref={mapRef}
          styleURL={StyleURL.SatelliteStreet}
          compassPosition={{ top: 54, right: 8 }}
          onPress={() => setActiveSpotId(null)}
        >
          <LocationPuck />

          <Camera
            ref={camera}
            allowUpdates
            defaultSettings={{ zoomLevel: 7, pitch: 0, heading: 0, centerCoordinate: initialCoords }}
          />
          {spotMarkers}
        </Map>

        <View className="absolute left-2 right-2 top-2">
          <Input
            className="bg-background dark:bg-background-dark rounded-sm"
            placeholder="Search here"
            onChangeText={setSearch}
            value={search}
            clearButtonMode="while-editing"
            returnKeyType="done"
          />
          {search && places && (
            <View className="bg-background dark:bg-background-dark rounded-b-sm p-2">
              {places.map((place, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setSearch("")
                    Keyboard.dismiss()
                    setCoords(place.center)
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

        {!!!activeSpotId && (
          <View
            style={{ transform: [{ translateX: -15 }, { translateY: -15 }] }}
            className="absolute left-1/2 top-1/2 flex items-center justify-center"
          >
            <Icon icon={CircleDot} size={30} color="white" />
          </View>
        )}
        <View
          pointerEvents="box-none"
          className="absolute bottom-3 left-3 right-3 flex flex-row items-end justify-between space-y-2"
        >
          <Link push href={`/filters/`} asChild>
            <TouchableOpacity
              activeOpacity={0.8}
              className="sq-12 bg-background dark:bg-background-dark flex flex-row items-center justify-center rounded-full"
            >
              <Icon icon={Settings2} size={20} />
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              const searchParams = new URLSearchParams({
                initialLat: coords?.[1]?.toString() || "",
                initialLng: coords?.[0]?.toString() || "",
                tripId: id,
                order: order || "",
              })
              router.push(`/new/?${searchParams}`)
            }}
            className="bg-primary rounded-full p-4"
          >
            <Icon icon={PlusCircle} size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSetUserLocation}
            className="sq-12 bg-background dark:bg-background-dark flex flex-row items-center justify-center rounded-full"
          >
            <Icon icon={Navigation} size={20} />
          </TouchableOpacity>
        </View>

        {activeSpotId && <AddTripSpotPreview spotId={activeSpotId} tripId={id} onClose={() => setActiveSpotId(null)} />}
      </View>
    </ScreenView>
  )
}

export function AddTripSpotPreview({ spotId, tripId, onClose }: { spotId: string; tripId: string; onClose: () => void }) {
  const { data: spot, isLoading } = api.spot.mapPreview.useQuery({ id: spotId })
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const utils = api.useUtils()
  React.useEffect(() => {
    if (!spot) return
    void utils.spot.detail.prefetch({ id: spot.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spot])

  const posthog = usePostHog()
  const { mutate } = api.trip.saveSpot.useMutation({
    onSuccess: (data) => {
      posthog?.capture("trip spot created", { spotId: data.spotId })
      void utils.trip.detail.refetch({ id })
      router.back()
    },
  })

  const handleAddToTrip = () => mutate({ tripId: tripId, spotId })

  return (
    <Animated.View
      style={{ width: "100%", position: "absolute", bottom: 0, zIndex: 1 }}
      entering={SlideInDown.duration(200)}
      exiting={SlideOutDown.duration(200)}
      className="rounded-t-xs bg-background dark:bg-background-dark p-4"
    >
      {isLoading ? (
        <View className="flex items-center justify-center p-10">
          <Spinner />
        </View>
      ) : !spot ? (
        <Text>Spot not found</Text>
      ) : (
        <View className="space-y-2">
          <TouchableOpacity onPress={() => router.push(`/(home)/(trips)/spot/${spot.id}`)} activeOpacity={0.9}>
            <SpotTypeBadge spot={spot} />
          </TouchableOpacity>

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

          <View className="rounded-xs overflow-hidden">
            <SpotImageCarousel
              canAddMore
              spotId={spot.id}
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

      <TouchableOpacity onPress={onClose} className="absolute right-2 top-2 flex items-center justify-center p-2">
        <Icon icon={X} size={20} />
      </TouchableOpacity>
    </Animated.View>
  )
}
