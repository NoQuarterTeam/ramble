import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import Mapbox, { Camera, type MapView as MapType } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { CircleDot, Navigation } from "lucide-react-native"

import { INITIAL_LATITUDE, INITIAL_LONGITUDE } from "@ramble/shared"

import { LoginPlaceholder } from "../../../../../components/LoginPlaceholder"
import { Button } from "../../../../../components/ui/Button"
import { useMe } from "../../../../../lib/hooks/useMe"
import { useRouter } from "../../../../router"
import { NewModalView } from "./NewModalView"

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
        const loc = await Location.getCurrentPositionAsync()
        setLocation(loc.coords)
      } catch {
        console.log("oops -  getting location")
      } finally {
        setIsLoadingLocation(false)
      }
    })()
  }, [])

  const handleSetUserLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync()
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

  if (!me) return <LoginPlaceholder title="New spot" text="Log in to start creating spots" />

  return (
    <NewModalView title="New spot" canGoBack={false}>
      {!isLoadingLocation && (
        <>
          <Mapbox.MapView
            className="flex-1 mb-10 mt-4 rounded-lg overflow-hidden"
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
            <View
              style={{ transform: [{ translateX: -15 }, { translateY: -15 }] }}
              className="absolute flex items-center justify-center top-1/2 left-1/2"
            >
              <CircleDot size={30} className="text-white" />
            </View>
          </Mapbox.MapView>

          <View className="absolute bottom-12 flex-row left-5 flex space-y-2 right-5 items-center justify-between">
            <View className="w-12" />
            {coords && (
              <Button
                className="rounded-full"
                onPress={() =>
                  router.push("NewSpotTypeScreen", {
                    location: { longitude: coords[0] as number, latitude: coords[1] as number },
                  })
                }
              >
                Next
              </Button>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSetUserLocation}
              className="flex flex-row items-center justify-center rounded-full bg-white sq-12"
            >
              <Navigation size={20} className="text-black" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </NewModalView>
  )
}
