import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import Mapbox, { Camera, type MapView as MapType } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { CircleDot, Navigation } from "lucide-react-native"

import { Icon } from "../../../../../../components/Icon"
import { Button } from "../../../../../../components/ui/Button"
import { toast } from "../../../../../../components/ui/Toast"
import { useMe } from "../../../../../../lib/hooks/useMe"
import { useParams, useRouter } from "../../../../../router"
import { EditSpotModalView } from "./EditSpotModalView"

export function EditSpotLocationScreen() {
  const { params } = useParams<"EditSpotLocationScreen">()

  const [coords, setCoords] = React.useState<number[]>([params.longitude, params.latitude])

  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)

  const { me } = useMe()
  const router = useRouter()

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

  return (
    <EditSpotModalView shouldRenderToast title="Edit spot" canGoBack={false}>
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

        <Camera ref={camera} allowUpdates defaultSettings={{ centerCoordinate: coords, zoomLevel: 14 }} />
      </Mapbox.MapView>
      <View
        style={{ transform: [{ translateX: -15 }, { translateY: -15 }] }}
        className="absolute left-1/2 top-1/2 flex items-center justify-center"
      >
        <Icon icon={CircleDot} size={30} color="white" />
      </View>

      <View className="absolute bottom-12 left-5 right-5 flex flex-row items-center justify-between space-y-2">
        <View className="w-12" />

        <Button
          className="bg-background rounded-full"
          textClassName="text-black"
          onPress={() => {
            if (!me) return
            if (!me.isVerified) return toast({ title: "Please verify your account" })
            if (!coords[0] || !coords[1]) return toast({ title: "Please select a location" })
            router.push("EditSpotTypeScreen", { ...params, latitude: coords[1], longitude: coords[0] })
          }}
        >
          Next
        </Button>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSetUserLocation}
          className="sq-12 bg-background flex flex-row items-center justify-center rounded-full"
        >
          <Icon icon={Navigation} size={20} color="black" />
        </TouchableOpacity>
      </View>
    </EditSpotModalView>
  )
}
