import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { Camera, type MapState, type MapView as MapType, StyleURL, UserLocation } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { AlertTriangle, CircleDot, MapPinned, Navigation } from "lucide-react-native"

import { INITIAL_LATITUDE, INITIAL_LONGITUDE, join } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { LoginPlaceholder } from "~/components/LoginPlaceholder"
import { Map } from "~/components/Map"
import { Button } from "~/components/ui/Button"
import { toast } from "~/components/ui/Toast"
import { Text } from "~/components/ui/Text"
import { useMe } from "~/lib/hooks/useMe"

import { NewSpotModalView } from "./NewSpotModalView"
import { api } from "~/lib/api"
import { Input } from "~/components/ui/Input"
import { Spinner } from "~/components/ui/Spinner"
import { useRouter } from "expo-router"

export default function NewSpotLocationScreen() {
  const [coords, setCoords] = React.useState<number[] | null>(null)
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
  } = api.spot.geocodeCoords.useQuery(
    {
      latitude: (coords && coords[1]) || 0,
      longitude: (coords && coords[0]) || 0,
    },
    { enabled: !!coords && !!coords[0] && !!coords[1], keepPreviousData: true },
  )
  const isUnknownAddress = !!!address
  const { data: geocodedCoords } = api.spot.geocodeAddress.useQuery({ address: search }, { enabled: !!search })

  const { data: hasCreatedSpot, isLoading: spotCheckLoading } = api.user.hasCreatedSpot.useQuery(undefined, {
    enabled: !!me,
  })

  React.useEffect(() => {
    if (!geocodedCoords || geocodedCoords.length === 0 || !geocodedCoords[0] || !geocodedCoords[1]) return
    setCoords(geocodedCoords)
    camera.current?.setCamera({
      zoomLevel: 14,
      animationDuration: 1000,
      animationMode: "flyTo",
      centerCoordinate: [geocodedCoords[0], geocodedCoords[1]],
    })
  }, [geocodedCoords])

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
  const onMapMove = ({ properties }: MapState) => setCoords(properties.center)

  if (spotCheckLoading) return null
  if (!me)
    return (
      <NewSpotModalView title="new spot" canGoBack={false}>
        <LoginPlaceholder text="Log in to start creating spots" />
      </NewSpotModalView>
    )

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
            icon={isUnknownAddress ? AlertTriangle : MapPinned}
            size={20}
            color={isUnknownAddress ? "primary" : undefined}
            className={join(!!!isUnknownAddress && "opacity-80")}
          />
        )}
        <Text numberOfLines={1} className="flex-1 text-sm opacity-70">
          {addressLoading ? "" : address || "Unknown address - move map to set"}
        </Text>
      </View>
      {!isLoadingLocation && (
        <View className="relative flex-1">
          <Map
            className="rounded-xs overflow-hidden"
            onMapIdle={onMapMove}
            ref={mapRef}
            styleURL={StyleURL.SatelliteStreet}
            compassPosition={{ top: 54, right: 8 }}
          >
            <UserLocation />

            <Camera
              ref={camera}
              allowUpdates
              defaultSettings={{
                centerCoordinate: [location?.longitude || INITIAL_LONGITUDE, location?.latitude || INITIAL_LATITUDE],
                zoomLevel: 14,
                pitch: 0,
                heading: 0,
              }}
            />
          </Map>
          <View className="absolute left-2 right-2 top-2">
            <Input
              className="bg-background dark:bg-background-dark rounded-sm"
              placeholder="Search here"
              onBlur={(e) => setSearch(e.nativeEvent.text)}
              onSubmitEditing={(e) => setSearch(e.nativeEvent.text)}
              clearButtonMode="while-editing"
              returnKeyType="search"
            />
          </View>
          <View
            style={{ transform: [{ translateX: -15 }, { translateY: -15 }] }}
            className="absolute left-1/2 top-1/2 flex items-center justify-center"
          >
            <Icon icon={CircleDot} size={30} color="white" />
          </View>

          <View
            pointerEvents="box-none"
            className="absolute bottom-5 left-5 right-5 flex flex-row items-center justify-between space-y-2"
          >
            <View className="w-12" />
            <Button
              className="bg-background rounded-full"
              textClassName="text-black"
              onPress={() => {
                if (!coords || !me || !address || isUnknownAddress) return
                if (!me.isVerified) return toast({ title: "Please verify your account" })
                if (!coords[0] || !coords[1]) return toast({ title: "Please select a location" })
                router.push({
                  pathname: `/new-spot/type`,
                  params: {
                    longitude: coords[0],
                    latitude: coords[1],
                    address,
                  },
                })
              }}
              disabled={!coords || (coords && (!coords[0] || !coords[1])) || !address || isUnknownAddress}
            >
              Next
            </Button>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSetUserLocation}
              className="sq-12 bg-background flex flex-row items-center justify-center rounded-full"
            >
              <Navigation size={20} className="text-black" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </NewSpotModalView>
  )
}
