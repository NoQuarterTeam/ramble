import { Camera, LocationPuck, type MapState, type MapView as MapType, StyleURL } from "@rnmapbox/maps"
import type { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position"
import { keepPreviousData } from "@tanstack/react-query"
import * as Location from "expo-location"
import { useLocalSearchParams, useRouter } from "expo-router"
import { CircleDot, Navigation } from "lucide-react-native"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"

import { Icon } from "~/components/Icon"
import { MapView } from "~/components/Map"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useMapCoords } from "~/lib/hooks/useMapCoords"

export default function AddImageLocation() {
  const router = useRouter()
  const { id, imageId } = useLocalSearchParams<{ id: string; imageId: string }>()

  const initialCoords = useMapCoords((s) => s.coords)
  const [coords, setCoords] = React.useState<Position | undefined>(initialCoords)

  const [search, setSearch] = React.useState("")

  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)
  const utils = api.useUtils()

  const { data: places } = api.mapbox.getPlaces.useQuery({ search }, { enabled: !!search, placeholderData: keepPreviousData })

  const handleSetUserLocation = async () => {
    try {
      const loc = await Location.getLastKnownPositionAsync()
      if (!loc) return
      camera.current?.setCamera({
        zoomLevel: 9,
        animationDuration: 0,
        animationMode: "none",
        centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
      })
    } catch {
      console.log("oops -  setting location")
    }
  }

  const onMapMove = ({ properties }: MapState) => {
    if (!properties.bounds) return
    setCoords(properties.center)
  }

  const { mutate, isPending: saveLoading } = api.trip.media.update.useMutation({
    onSuccess: () => {
      if (!coords) return
      void utils.trip.media.byId.refetch({ id: imageId })
      utils.trip.media.all.setData({ skip: 0, tripId: id }, (prev) =>
        prev
          ? {
              total: prev.total,
              items: prev.items.map((media) =>
                media.id === imageId ? { ...media, latitude: coords[1]!, longitude: coords[0]! } : media,
              ),
            }
          : prev,
      )

      router.back()
    },
  })

  const handleSelectLocation = () => {
    if (!coords) return toast({ title: "Please select a location" })
    mutate({ id: imageId, longitude: coords[0]!, latitude: coords[1]! })
  }

  return (
    <ModalView edges={["top", "bottom"]} title="choose a location">
      <View className="relative flex-1">
        <MapView
          className="overflow-hidden rounded-xs"
          onMapIdle={onMapMove}
          ref={mapRef}
          styleURL={StyleURL.SatelliteStreet}
          compassPosition={{ top: 54, right: 8 }}
        >
          <LocationPuck />

          <Camera
            ref={camera}
            allowUpdates
            followUserLocation={false}
            defaultSettings={{
              centerCoordinate: [initialCoords[0], initialCoords[1]],
              zoomLevel: 5,
              pitch: 0,
              heading: 0,
            }}
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

        <View
          pointerEvents="box-none"
          className="absolute right-5 bottom-5 left-5 flex flex-row items-center justify-between space-y-2"
        >
          <View className="w-12" />
          <Button
            className="rounded-full bg-background"
            textClassName="text-black"
            onPress={handleSelectLocation}
            isLoading={saveLoading}
            disabled={!coords || (coords && (!coords[0] || !coords[1])) || saveLoading}
          >
            Save
          </Button>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSetUserLocation}
            className="sq-12 flex flex-row items-center justify-center rounded-full bg-background"
          >
            <Navigation size={20} className="text-black" />
          </TouchableOpacity>
        </View>
      </View>
    </ModalView>
  )
}
