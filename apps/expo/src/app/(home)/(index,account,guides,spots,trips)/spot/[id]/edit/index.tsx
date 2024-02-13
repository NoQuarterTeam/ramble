import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { Camera, type MapState, type MapView as MapType, StyleURL, UserLocation } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { useLocalSearchParams, useRouter } from "expo-router"
import { AlertTriangle, CircleDot, MapPinned, Navigation } from "lucide-react-native"

import { Icon } from "~/components/Icon"
import { Map } from "~/components/Map"
import { Button } from "~/components/ui/Button"
import { toast } from "~/components/ui/Toast"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { EditSpotModalView } from "./EditSpotModalView"
import { Spinner } from "~/components/ui/Spinner"
import { api } from "~/lib/api"
import { Text } from "~/components/ui/Text"
import { Input } from "~/components/ui/Input"

export default function EditSpotLocationScreen() {
  const { id, ...params } = useLocalSearchParams<{ id: string; longitude: string; latitude: string }>()
  const [search, setSearch] = React.useState("")
  const [coords, setCoords] = React.useState<number[]>([Number(params.longitude), Number(params.latitude)])

  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)
  const {
    data: address,
    isLoading: addressLoading,
    isFetching,
  } = api.mapbox.geocodeCoords.useQuery(
    { latitude: coords?.[1]!, longitude: coords?.[0]! },
    { enabled: !!coords?.[0] && !!coords?.[1], keepPreviousData: true },
  )

  const { data: geocodedCoords } = api.mapbox.geocodeAddress.useQuery({ address: search }, { enabled: !!search })

  React.useEffect(() => {
    if (!geocodedCoords) return
    setCoords(geocodedCoords)
    camera.current?.setCamera({
      zoomLevel: 14,
      animationDuration: 1000,
      animationMode: "flyTo",
      centerCoordinate: [geocodedCoords[0], geocodedCoords[1]],
    })
  }, [geocodedCoords])

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
  const addressToUse = address?.address || address?.place
  const tab = useTabSegment()
  return (
    <EditSpotModalView shouldRenderToast title="edit spot" canGoBack={false}>
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
      <View className="relative flex-1">
        <Map
          className="rounded-xs overflow-hidden"
          onMapIdle={onMapMove}
          ref={mapRef}
          compassPosition={{ top: 54, right: 8 }}
          styleURL={StyleURL.SatelliteStreet}
        >
          <UserLocation />
          <Camera ref={camera} allowUpdates defaultSettings={{ centerCoordinate: coords, zoomLevel: 14, pitch: 0, heading: 0 }} />
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
      </View>
    </EditSpotModalView>
  )
}
