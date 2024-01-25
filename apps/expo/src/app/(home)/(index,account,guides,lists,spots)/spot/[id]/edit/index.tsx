import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { Camera, type MapState, type MapView as MapType, StyleURL, UserLocation } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { useLocalSearchParams, useRouter } from "expo-router"
import { CircleDot, Navigation } from "lucide-react-native"

import { Icon } from "~/components/Icon"
import { Map } from "~/components/Map"
import { Button } from "~/components/ui/Button"
import { toast } from "~/components/ui/Toast"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { EditSpotModalView } from "./EditSpotModalView"

export default function EditSpotLocationScreen() {
  const { id, ...params } = useLocalSearchParams<{ id: string; longitude: string; latitude: string }>()

  const [coords, setCoords] = React.useState<number[]>([Number(params.longitude), Number(params.latitude)])

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
  const onMapMove = ({ properties }: MapState) => setCoords(properties.center)

  const tab = useTabSegment()
  return (
    <EditSpotModalView shouldRenderToast title="edit spot" canGoBack={false}>
      <Map
        className="rounded-xs mb-10 mt-4 flex-1 overflow-hidden"
        onMapIdle={onMapMove}
        ref={mapRef}
        styleURL={StyleURL.SatelliteStreet}
      >
        <UserLocation />
        <Camera ref={camera} allowUpdates defaultSettings={{ centerCoordinate: coords, zoomLevel: 14, pitch: 0, heading: 0 }} />
      </Map>
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

            const searchParams = new URLSearchParams({
              ...params,
              latitude: coords[1].toString(),
              longitude: coords[0].toString(),
            })
            router.push(`/${tab}/spot/${id}/edit/type?${searchParams}`)
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
