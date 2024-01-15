import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { Camera, type MapState, type MapView as MapType, StyleURL, UserLocation } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { CircleDot, Navigation } from "lucide-react-native"

import { INITIAL_LATITUDE, INITIAL_LONGITUDE } from "@ramble/shared"

import { Icon } from "../../../../../components/Icon"
import { LoginPlaceholder } from "../../../../../components/LoginPlaceholder"
import { Map } from "../../../../../components/Map"
import { Button } from "../../../../../components/ui/Button"
import { toast } from "../../../../../components/ui/Toast"
import { Text } from "../../../../../components/ui/Text"
import { useMe } from "../../../../../lib/hooks/useMe"
import { useParams, useRouter } from "../../../../router"
import { NewSpotModalView } from "./NewSpotModalView"
import { api } from "../../../../../lib/api"
import { Input } from "../../../../../components/ui/Input"

export function NewSpotLocationScreen() {
  const [coords, setCoords] = React.useState<number[] | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(true)
  const [hasCustomAddress, setHasCustomAddress] = React.useState(false)
  const [customAddress, setCustomAddress] = React.useState("")
  const [location, setLocation] = React.useState<Location.LocationObjectCoords | null>(null)
  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)
  const { params } = useParams<"NewSpotLocationScreen">()

  const { me } = useMe()
  const router = useRouter()

  const { data: address, isLoading } = api.spot.geocodeCoords.useQuery(
    {
      latitude: (coords && coords[1]) || 0,
      longitude: (coords && coords[0]) || 0,
    },
    { enabled: !!coords },
  )

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

  if (!me)
    return (
      <NewSpotModalView title="new spot" canGoBack={false}>
        <LoginPlaceholder text="Log in to start creating spots" />
      </NewSpotModalView>
    )

  return (
    <NewSpotModalView
      shouldRenderToast
      title={params.canClose ? "new spot" : "add your first spot"}
      canGoBack={false}
      canClose={params.canClose}
    >
      {!params.canClose && (
        <Text className="text-sm leading-4">
          It's important to contribute to the Ramble community, why not start by sharing your favourite spot with everyone!
        </Text>
      )}
      {!hasCustomAddress ? (
        <>
          <Input
            nativeID="address"
            value={isLoading ? "Loading ..." : address}
            editable={false}
            placeholder="Address - move map to set"
          />
          <Button variant="link" size="sm" onPress={() => setHasCustomAddress(true)}>
            enter a custom address
          </Button>
        </>
      ) : (
        <>
          <Input
            nativeID="customAddress"
            value={customAddress}
            onChangeText={setCustomAddress}
            editable // weirdly having to set this to true, otherwise it's not editable after the switch in state
            placeholder="Enter a custom address"
          />
          <Button variant="link" size="sm" onPress={() => setHasCustomAddress(false)}>
            back to using the map
          </Button>
        </>
      )}
      {!isLoadingLocation && (
        <>
          <Map
            className="rounded-xs mt-2 flex-1 overflow-hidden"
            onMapIdle={onMapMove}
            ref={mapRef}
            styleURL={StyleURL.SatelliteStreet}
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
          <View
            style={{ transform: [{ translateX: -15 }, { translateY: -15 }] }}
            className="absolute left-1/2 top-1/2 flex items-center justify-center"
          >
            <Icon icon={CircleDot} size={30} color="white" />
          </View>

          <View
            pointerEvents="box-none"
            className="absolute bottom-12 left-5 right-5 flex flex-row items-center justify-between space-y-2"
          >
            <View className="w-12" />
            {coords && address && address !== "Unknown address" && (
              <Button
                className="bg-background rounded-full"
                textClassName="text-black"
                onPress={() => {
                  if (!me || !address || address === "Unknown address") return
                  if (!me.isVerified) return toast({ title: "Please verify your account" })
                  if (!coords[0] || !coords[1]) return toast({ title: "Please select a location" })
                  router.push("NewSpotTypeScreen", { longitude: coords[0], latitude: coords[1], canClose: params.canClose })
                }}
              >
                Next
              </Button>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSetUserLocation}
              className="sq-12 bg-background flex flex-row items-center justify-center rounded-full"
            >
              <Navigation size={20} className="text-black" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </NewSpotModalView>
  )
}
