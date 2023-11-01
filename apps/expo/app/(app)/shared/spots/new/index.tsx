import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import Mapbox, { Camera, type MapView as MapType } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { CircleDot, Navigation } from "lucide-react-native"

import { INITIAL_LATITUDE, INITIAL_LONGITUDE } from "@ramble/shared"

import { LoginPlaceholder } from "../../../../../components/LoginPlaceholder"
import { Button } from "../../../../../components/ui/Button"
import { toast } from "../../../../../components/ui/Toast"
import { useMe } from "../../../../../lib/hooks/useMe"
import { useRouter } from "../../../../router"
import { NewSpotModalView } from "./NewSpotModalView"
import { Icon } from "../../../../../components/Icon"

export function NewSpotLocationScreen() {
  const [coords, setCoords] = React.useState<number[] | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(true)
  const [location, setLocation] = React.useState<Location.LocationObjectCoords | null>(null)
  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)

  const { me } = useMe()
  const router = useRouter()

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
  const onMapMove = ({ properties }: Mapbox.MapState) => setCoords(properties.center)

  if (!me)
    return (
      <NewSpotModalView title="new spot" canGoBack={false}>
        <LoginPlaceholder text="Log in to start creating spots" />
      </NewSpotModalView>
    )

  return (
    <NewSpotModalView shouldRenderToast title="new spot" canGoBack={false}>
      {!isLoadingLocation && (
        <>
          <Mapbox.MapView
            className="rounded-xs mb-10 mt-4 flex-1 overflow-hidden"
            logoEnabled={false}
            compassEnabled
            onMapIdle={onMapMove}
            ref={mapRef}
            pitchEnabled={false}
            compassFadeWhenNorth
            scaleBarEnabled={false}
            styleURL="mapbox://styles/mapbox/satellite-v9"
          >
            <Mapbox.UserLocation />

            <Camera
              ref={camera}
              allowUpdates
              defaultSettings={{
                centerCoordinate: [location?.longitude || INITIAL_LONGITUDE, location?.latitude || INITIAL_LATITUDE],
                zoomLevel: 14,
              }}
            />
          </Mapbox.MapView>
          <View
            style={{ transform: [{ translateX: -15 }, { translateY: -15 }] }}
            className="absolute left-1/2 top-1/2 flex items-center justify-center"
          >
            <Icon icon={CircleDot} size={30} color="white" />
          </View>

          <View className="absolute bottom-12 left-5 right-5 flex flex-row items-center justify-between space-y-2">
            <View className="w-12" />
            {coords && (
              <Button
                className="bg-background rounded-full"
                textClassName="text-black"
                onPress={() => {
                  if (!me) return
                  if (!me.isVerified) return toast({ title: "Please verify your account" })
                  if (!coords[0] || !coords[1]) return toast({ title: "Please select a location" })
                  router.push("NewSpotTypeScreen", { longitude: coords[0], latitude: coords[1] })
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
