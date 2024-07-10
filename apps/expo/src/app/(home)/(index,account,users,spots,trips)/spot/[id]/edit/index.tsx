import { Camera, LocationPuck, type MapState, type MapView as MapType, StyleURL } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { useLocalSearchParams, useRouter } from "expo-router"
import { AlertTriangle, CircleDot, MapPinned, Navigation } from "lucide-react-native"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"

import { Icon } from "~/components/Icon"
import { MapView } from "~/components/Map"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { keepPreviousData } from "@tanstack/react-query"
import { EditSpotModalView } from "./EditSpotModalView"

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
    { enabled: !!coords?.[0] && !!coords?.[1], placeholderData: keepPreviousData },
  )

  const { data: places } = api.mapbox.getPlaces.useQuery({ search }, { enabled: !!search, placeholderData: keepPreviousData })

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
        <MapView
          className="overflow-hidden rounded-xs"
          onMapIdle={onMapMove}
          ref={mapRef}
          compassPosition={{ top: 54, right: 8 }}
          styleURL={StyleURL.SatelliteStreet}
        >
          <LocationPuck />
          <Camera
            ref={camera}
            allowUpdates
            followUserLocation={false}
            defaultSettings={{ centerCoordinate: coords, zoomLevel: 14, pitch: 0, heading: 0 }}
          />
        </MapView>
        <View className="absolute top-2 right-2 left-2">
          <Input
            className="rounded-sm bg-background dark:bg-background-dark"
            placeholder="Search here"
            onChangeText={setSearch}
            value={search}
            clearButtonMode="while-editing"
            returnKeyType="done"
          />
          {search && places && (
            <View className="rounded-b-sm bg-background p-2 dark:bg-background-dark">
              {places.map((place, i) => (
                <TouchableOpacity
                  key={`${place.name}-${i}`}
                  onPress={() => {
                    setSearch("")
                    setCoords(place.center)
                    camera.current?.setCamera({
                      zoomLevel: 9,
                      animationDuration: 1000,
                      animationMode: "flyTo",
                      centerCoordinate: place.center,
                    })
                  }}
                  className="p-2"
                >
                  <Text numberOfLines={1}>{place.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View
          style={{ transform: [{ translateX: -15 }, { translateY: -15 }] }}
          className="absolute top-1/2 left-1/2 flex items-center justify-center"
        >
          <Icon icon={CircleDot} size={30} color="white" />
        </View>

        <View className="absolute right-5 bottom-12 left-5 flex flex-row items-center justify-between space-y-2">
          <View className="w-10" />

          <Button
            className="bg-background"
            textClassName="text-black"
            size="sm"
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
            className="sq-10 flex flex-row items-center justify-center rounded-sm bg-background"
          >
            <Icon icon={Navigation} size={16} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </EditSpotModalView>
  )
}
