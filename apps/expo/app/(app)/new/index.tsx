import * as React from "react"
import { TouchableOpacity, View, useColorScheme } from "react-native"
import Mapbox, { Camera, type MapView as MapType } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { LoginPlaceholder } from "../../../components/LoginPlaceholder"
import { Heading } from "../../../components/ui/Heading"
import { useMe } from "../../../lib/hooks/useMe"
import { INITIAL_LATITUDE, INITIAL_LONGITUDE } from "@ramble/shared"
import { Navigation, CircleDot } from "lucide-react-native"
import { Button } from "../../../components/ui/Button"
import { useRouter } from "../../router"

export function NewSpotLocationScreen() {
  const theme = useColorScheme()
  const [coords, setCoords] = React.useState<number[] | null>(null)
  const isDark = theme === "dark"
  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)
  const [location, setLocation] = React.useState<Location.LocationObjectCoords | null>(null)
  const { me } = useMe()
  const router = useRouter()

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

  const onMapMove = ({ properties }: Mapbox.MapState) => setCoords(properties.center)

  if (!me) return <LoginPlaceholder title="New spot" text="Log in to start creating spots" />
  return (
    <View className="p-4 pt-16 h-full">
      <View className="flex mb-4 flex-row items-start justify-between">
        <Heading className="text-3xl">New spot</Heading>
        {coords && (
          <Button
            size="sm"
            variant="link"
            onPress={() =>
              router.push("NewSpotTypeScreen", { location: { longitude: coords[0] as number, latitude: coords[1] as number } })
            }
          >
            Next
          </Button>
        )}
      </View>

      <Mapbox.MapView
        className="flex-1  rounded-lg overflow-hidden"
        logoEnabled={false}
        compassEnabled
        onMapIdle={onMapMove}
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
          defaultSettings={{
            centerCoordinate: [location?.longitude || INITIAL_LONGITUDE, location?.latitude || INITIAL_LATITUDE],
            zoomLevel: 14,
          }}
        />
        <View
          style={{ transform: [{ translateX: -15 }, { translateY: -15 }] }}
          className="absolute flex items-center justify-center top-1/2 left-1/2"
        >
          <CircleDot size={30} className="text-black" />
        </View>
      </Mapbox.MapView>

      {!!location && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => camera.current?.moveTo([location.longitude, location.latitude])}
          className="absolute bottom-6 right-6 flex flex-row items-center justify-center rounded-full bg-white p-3"
        >
          <Navigation size={20} className="text-black" />
        </TouchableOpacity>
      )}
    </View>
  )
}
