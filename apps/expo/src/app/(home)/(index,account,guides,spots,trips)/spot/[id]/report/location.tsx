import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { Camera, type MapState, type MapView as MapType, LocationPuck } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { useLocalSearchParams, useRouter } from "expo-router"
import { CircleDot, Navigation } from "lucide-react-native"

import { Icon } from "~/components/Icon"
import { Map } from "~/components/Map"
import { Button } from "~/components/ui/Button"
import { Text } from "~/components/ui/Text"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { ReportSpotModalView } from "./ReportSpotModalView"

export default function SpotReportLocationScreen() {
  const router = useRouter()
  const { id, ...params } = useLocalSearchParams<{ id: string; latitude: string; longitude: string }>()
  const [latitude, setLatitude] = React.useState(Number(params.latitude))
  const [longitude, setLongitude] = React.useState(Number(params.longitude))
  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)

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
    if (!!properties.center[0] && !!properties.center[1]) {
      setLatitude(properties.center[1])
      setLongitude(properties.center[0])
    }
  }

  const tab = useTabSegment()
  const onClose = () => {
    router.navigate(
      `/${tab}/spot/${id}/report?${new URLSearchParams({ ...params, latitude: String(latitude), longitude: String(longitude) })}`,
    )
  }

  return (
    <ReportSpotModalView title="location">
      <View className="flex-grow space-y-2">
        <View className="flex flex-row items-center justify-between">
          <Text>Set the correct location</Text>
          <Button
            size="sm"
            variant="link"
            className="h-5 rounded-full"
            onPress={() => {
              router.navigate(`/${tab}/spot/${id}/report?${new URLSearchParams({ ...params, isLocationUnknown: "true" })}`)
            }}
          >
            Not sure?
          </Button>
        </View>
        <Map
          className="rounded-xs mb-10 mt-4 flex-1 overflow-hidden"
          onMapIdle={onMapMove}
          ref={mapRef}
          styleURL="mapbox://styles/jclackett/clp122bar007z01qu21kc8h4g"
        >
          <LocationPuck />
          <Camera ref={camera} allowUpdates defaultSettings={{ centerCoordinate: [longitude, latitude], zoomLevel: 14 }} />
        </Map>
        <View
          style={{ transform: [{ translateX: -15 }, { translateY: -15 }] }}
          className="absolute left-1/2 top-1/2 flex items-center justify-center"
        >
          <Icon icon={CircleDot} size={30} color="white" />
        </View>
        <View
          pointerEvents="box-none"
          className="absolute bottom-12 left-2 right-2 flex flex-row items-center justify-between space-y-2"
        >
          <View className="flex-1" pointerEvents="box-none" />
          <View className="flex-1 items-center justify-center">
            <Button className="bg-background rounded-full" textClassName="text-black" onPress={onClose}>
              Done
            </Button>
          </View>
          <View className="flex-1 items-end">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSetUserLocation}
              className="sq-12 bg-background flex flex-row items-center justify-center rounded-full"
            >
              <Icon icon={Navigation} size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ReportSpotModalView>
  )
}
