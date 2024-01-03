import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { Camera, type MapState, type MapView as MapType, UserLocation } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { CircleDot, Navigation, X } from "lucide-react-native"

import { Icon } from "../../../../../../components/Icon"
import { Map } from "../../../../../../components/Map"
import { BrandHeading } from "../../../../../../components/ui/BrandHeading"
import { Button } from "../../../../../../components/ui/Button"
import { Text } from "../../../../../../components/ui/Text"

interface Props {
  isLocationUnknown: boolean | null
  setIsLocationUnknown: React.Dispatch<React.SetStateAction<boolean | null>>
  latitude: number
  setLatitude: React.Dispatch<React.SetStateAction<number>>
  longitude: number
  setLongitude: React.Dispatch<React.SetStateAction<number>>
  handleClose: () => void
}

export function ReportSpotEditLocation({
  isLocationUnknown,
  setIsLocationUnknown,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  handleClose,
}: Props) {
  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)

  const [showMap, setShowMap] = React.useState(false)

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

  return (
    <View className="flex-grow">
      <View className="flex flex-row justify-between pb-2">
        <BrandHeading className="text-3xl">Location</BrandHeading>
        <TouchableOpacity onPress={handleClose} className="p-1">
          <Icon icon={X} size={24} />
        </TouchableOpacity>
      </View>
      {!showMap ? (
        <View className="flex space-y-2 pt-4">
          <Button
            variant="outline"
            onPress={() => {
              setIsLocationUnknown(false)
              setShowMap(true)
            }}
          >
            I know the correct location
          </Button>
          <Text className="text-center">or</Text>
          <Button
            variant="outline"
            onPress={() => {
              setIsLocationUnknown(true)
              handleClose()
            }}
          >
            I don't know where it is
          </Button>
        </View>
      ) : (
        <View className="flex-grow space-y-2">
          <Text>Set the correct location using the map</Text>
          <Map
            className="rounded-xs mb-10 mt-4 flex-1 overflow-hidden"
            onMapIdle={onMapMove}
            ref={mapRef}
            styleURL="mapbox://styles/jclackett/clp122bar007z01qu21kc8h4g"
          >
            <UserLocation />
            <Camera ref={camera} allowUpdates defaultSettings={{ centerCoordinate: [longitude, latitude], zoomLevel: 14 }} />
          </Map>
          <View
            style={{ transform: [{ translateX: -15 }, { translateY: -15 }] }}
            className="absolute left-1/2 top-1/2 flex items-center justify-center"
          >
            <Icon icon={CircleDot} size={30} color="white" />
          </View>
          <View className="absolute bottom-12 left-2 right-2 flex flex-row items-center justify-between space-y-2">
            <View className="w-12" />
            <Button className="bg-background rounded-full" textClassName="text-black" onPress={handleClose}>
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
        </View>
      )}
    </View>
  )
}
