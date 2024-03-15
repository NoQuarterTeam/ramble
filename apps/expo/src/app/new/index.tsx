import { Camera, LocationPuck, type MapState, type MapView as MapType, MarkerView, StyleURL } from "@rnmapbox/maps"
import { Image } from "expo-image"
import * as Location from "expo-location"
import { useLocalSearchParams, useRouter } from "expo-router"
import { AlertTriangle, CircleDot, MapPinned, Navigation, X } from "lucide-react-native"
import * as React from "react"
import { TouchableOpacity, View, useColorScheme } from "react-native"

import { INITIAL_LATITUDE, INITIAL_LONGITUDE, merge } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { LoginPlaceholder } from "~/components/LoginPlaceholder"
import { MapView } from "~/components/Map"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"

import type { GooglePlace } from "@ramble/api/src/router/google"
import { FlashList } from "@shopify/flash-list"
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated"
import { SpotMarker } from "~/components/SpotMarker"
import { SpotTypeBadge } from "~/components/SpotTypeBadge"
import { Empty } from "~/components/ui/SpotImageCarousel"
import { isTablet, width } from "~/lib/device"
import { useBackgroundColor } from "~/lib/tailwind"
import { NewSpotModalView } from "./NewSpotModalView"

type Bounds = {
  ne: number[]
  sw: number[]
}

export default function NewSpotLocationScreen() {
  const params = useLocalSearchParams<{ redirect?: string; initialLat?: string; initialLng?: string }>()

  const initialLat = params.initialLat && Number.parseFloat(params.initialLat)
  const initialLng = params.initialLng && Number.parseFloat(params.initialLng)

  const [coords, setCoords] = React.useState<number[] | null>(null)
  const [bounds, setBounds] = React.useState<Bounds>({ ne: [], sw: [] })
  const [activeGooglePlace, setActiveGooglePlace] = React.useState<GooglePlace>()

  const [isLoadingLocation, setIsLoadingLocation] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [location, setLocation] = React.useState<Location.LocationObjectCoords | null>(null)
  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)

  const { me } = useMe()

  const router = useRouter()

  const {
    data: address,
    isLoading: addressLoading,
    isFetching,
  } = api.mapbox.geocodeCoords.useQuery(
    { latitude: coords?.[1]!, longitude: coords?.[0]! },
    { enabled: !!coords?.[0] && !!coords?.[1], keepPreviousData: true },
  )

  const { data: places } = api.mapbox.getPlaces.useQuery({ search }, { enabled: !!search, keepPreviousData: true })
  const { data: googleData } = api.google.getPlacesInBounds.useQuery(
    { ne: bounds.ne, sw: bounds.sw },
    { enabled: bounds.ne.length > 0 && bounds.sw.length > 0, keepPreviousData: true },
  )
  const googlePlaces = googleData || []

  const { data: hasCreatedSpot, isLoading: spotCheckLoading } = api.user.hasCreatedSpot.useQuery(undefined, {
    enabled: !!me,
  })

  React.useEffect(() => {
    ;(async () => {
      try {
        const loc = await Location.getLastKnownPositionAsync()
        if (!loc) return
        setLocation(loc.coords)
      } catch {
        console.log("oops - getting location")
      } finally {
        setIsLoadingLocation(false)
      }
    })()
  }, [])

  const handleSetUserLocation = async () => {
    try {
      const loc = await Location.getLastKnownPositionAsync()
      if (!loc) return
      camera.current?.setCamera({
        zoomLevel: 14,
        animationDuration: 0,
        animationMode: "none",
        centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
      })
    } catch {
      console.log("oops -  setting location")
    }
  }
  const onMapMove = ({ properties }: MapState) => {
    setCoords(properties.center)
    setBounds({
      ne: properties.bounds.ne,
      sw: properties.bounds.sw,
    })
  }

  if (me && spotCheckLoading) return null

  if (!me)
    return (
      <NewSpotModalView title="new spot" canGoBack={false}>
        <LoginPlaceholder text="Log in to start creating spots" />
      </NewSpotModalView>
    )

  const addressToUse = address?.address || address?.place

  return (
    <NewSpotModalView shouldRenderToast title={hasCreatedSpot ? "new spot" : "add your first spot"} canGoBack={false}>
      {!hasCreatedSpot && (
        <Text className="mb-2 text-sm leading-4">
          It's highly encouraged to contribute to the Ramble community, so why not start by sharing your favourite spot with
          everyone!
        </Text>
      )}
      <View className="mb-2 flex w-full flex-row items-center space-x-1 overflow-hidden">
        {addressLoading || isFetching ? (
          <Spinner size="small" />
        ) : (
          <Icon
            icon={!addressToUse ? AlertTriangle : MapPinned}
            size={20}
            color={!addressToUse ? "primary" : undefined}
            className="opacity-80"
          />
        )}
        <Text numberOfLines={1} className="flex-1 text-sm opacity-70">
          {addressLoading ? "" : addressToUse || "Unknown address - move map to set"}
        </Text>
      </View>
      {!isLoadingLocation && (
        <View className="relative flex-1">
          <MapView
            className="overflow-hidden rounded-xs"
            onMapIdle={onMapMove}
            ref={mapRef}
            styleURL={StyleURL.SatelliteStreet}
            compassPosition={{ top: 54, right: 8 }}
          >
            <LocationPuck />

            <Camera
              ref={camera}
              allowUpdates
              followUserLocation={false}
              defaultSettings={{
                centerCoordinate: [
                  initialLng || location?.longitude || INITIAL_LONGITUDE,
                  initialLat || location?.latitude || INITIAL_LATITUDE,
                ],
                zoomLevel: 14,
                pitch: 0,
                heading: 0,
              }}
            />
            {googlePlaces.map((data) => (
              <MarkerView
                allowOverlap
                allowOverlapWithPuck
                key={data.displayName.text}
                coordinate={[data.location.longitude, data.location.latitude]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setActiveGooglePlace(data)
                    camera.current?.setCamera({
                      centerCoordinate: [data.location.longitude, data.location.latitude],
                      animationMode: "linearTo",
                      animationDuration: 300,
                      padding: { paddingBottom: 250, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
                    })
                  }}
                >
                  <SpotMarker spot={{ type: "CAMPING" }} />
                </TouchableOpacity>
              </MarkerView>
            ))}
          </MapView>
          {activeGooglePlace && (
            <GooglePlacePreview
              place={activeGooglePlace}
              setActiveGooglePlace={setActiveGooglePlace}
              addressToUse={addressToUse}
              coords={coords}
            />
          )}
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
          <View
            style={{ transform: [{ translateX: -15 }, { translateY: -15 }] }}
            className="absolute top-1/2 left-1/2 flex items-center justify-center"
          >
            <Icon icon={CircleDot} size={30} color="white" />
          </View>

          <View
            pointerEvents="box-none"
            className="absolute right-5 bottom-5 left-5 flex flex-row items-center justify-between space-y-2"
          >
            <View className="w-12" />
            <Button
              className="rounded-full bg-background"
              textClassName="text-black"
              onPress={() => {
                if (!me) return
                if (!coords || !addressToUse) return toast({ title: "Please select a valid location" })
                if (!me.isVerified) return toast({ title: "Please verify your account" })
                if (!coords[0] || !coords[1]) return toast({ title: "Please select a location" })
                router.push(
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  `/new/type?${new URLSearchParams({
                    ...params,
                    longitude: coords[0],
                    latitude: coords[1],
                    address: addressToUse,
                  })}`,
                )
              }}
              disabled={!coords || (coords && (!coords[0] || !coords[1])) || !addressToUse}
            >
              Next
            </Button>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSetUserLocation}
              className="sq-12 flex flex-row items-center justify-center rounded-full bg-background"
            >
              <Navigation size={20} className="text-black" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </NewSpotModalView>
  )
}

interface Props {
  place: GooglePlace
  setActiveGooglePlace: React.Dispatch<React.SetStateAction<GooglePlace | undefined>>
  addressToUse?: string
  coords: number[] | null
}

function GooglePlacePreview({ place, setActiveGooglePlace, addressToUse, coords }: Props) {
  const { me } = useMe()
  const router = useRouter()
  const params = useLocalSearchParams<{ redirect?: string; initialLat?: string; initialLng?: string }>()

  const { data, isLoading } = api.google.getPlacePhotos.useQuery(
    { names: place.photos.map((photo) => photo.name) },
    { enabled: place.photos.length > 0, keepPreviousData: true },
  )
  const images = data || []

  const backgroundColor = useBackgroundColor()
  const colorScheme = useColorScheme()
  const ref = React.useRef<FlashList<string>>(null)
  const [imageIndex, setImageIndex] = React.useState(0)
  const noOfColumns = isTablet ? 2 : 1
  const itemWidth = (width - 32) / (noOfColumns || 1) - (noOfColumns && noOfColumns > 1 ? 10 : 0)
  return (
    <Animated.View
      style={{ width: "100%", height: 400, position: "absolute", backgroundColor, bottom: 0, zIndex: 1 }}
      entering={SlideInDown.duration(200)}
      exiting={SlideOutDown.duration(200)}
      className="rounded-t-xs p-4"
    >
      <View className="space-y-2">
        <SpotTypeBadge spot={{ type: "CAMPING" }} />
        <Text numberOfLines={1} className="text-lg leading-6">
          {place.displayName.text}
        </Text>
        <View className="overflow-hidden rounded-xs">
          <View style={{ width: width - 32, height: 235 }} className="bg-background dark:bg-background-dark">
            {isLoading ? (
              <Spinner style={{ width: width - 64, height: 235 }} />
            ) : (
              <>
                <FlashList
                  ref={ref}
                  pagingEnabled
                  scrollEnabled={place.photos.length > 1}
                  horizontal
                  onMomentumScrollEnd={(e) => {
                    const { x } = e.nativeEvent.contentOffset
                    const index = Math.round(x / width)
                    setImageIndex(index)
                  }}
                  estimatedItemSize={width - 32}
                  showsHorizontalScrollIndicator={false}
                  data={images}
                  ListEmptyComponent={<Empty width={itemWidth} height={235} />}
                  renderItem={({ item: image }) => (
                    <Image
                      source={{ uri: image }}
                      style={{ width: itemWidth, height: 235, marginHorizontal: noOfColumns && noOfColumns > 1 ? 5 : 0 }}
                      className="rounded-xs object-cover"
                    />
                  )}
                />
                {images.length > 1 && (
                  <View className="absolute right-2 bottom-2 rounded-xs bg-gray-800/70 p-1">
                    <Text className="text-white text-xs">{`${imageIndex + 1}/${images.length / (noOfColumns || 1)}`}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
        <Button
          className="rounded-full bg-background"
          textClassName="text-black"
          variant="outline"
          onPress={() => {
            if (!me) return
            if (!coords || !addressToUse) return toast({ title: "Please select a valid location" })
            if (!me.isVerified) return toast({ title: "Please verify your account" })
            if (!coords[0] || !coords[1]) return toast({ title: "Please select a location" })
            router.push(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              `/new/type?${new URLSearchParams({
                ...params,
                type: "CAMPING",
                name: place.displayName.text,
                images: images.join(","),
                longitude: coords[0],
                latitude: coords[1],
                address: addressToUse,
              })}`,
            )
          }}
          disabled={!coords || (coords && (!coords[0] || !coords[1])) || !addressToUse}
        >
          Next
        </Button>
      </View>

      <TouchableOpacity
        onPress={() => setActiveGooglePlace(undefined)}
        className="absolute top-2 right-2 flex items-center justify-center p-2"
      >
        <X size={24} color={colorScheme === "dark" ? "white" : "black"} />
      </TouchableOpacity>
    </Animated.View>
  )
}
