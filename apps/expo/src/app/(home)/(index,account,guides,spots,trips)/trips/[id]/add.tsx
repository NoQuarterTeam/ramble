import * as React from "react"
import { Link, useLocalSearchParams, useRouter } from "expo-router"
import * as Location from "expo-location"

import { Map } from "~/components/Map"

import { Camera, UserLocation, type MapView as MapType, StyleURL, MapState } from "@rnmapbox/maps"
import { join } from "@ramble/shared"
import { TouchableOpacity, View } from "react-native"
import { RouterOutputs, api } from "~/lib/api"
import { Spinner } from "~/components/ui/Spinner"
import { Icon } from "~/components/Icon"
import { Text } from "~/components/ui/Text"
import { AlertTriangle, CircleDot, MapPinned, Navigation, Settings2 } from "lucide-react-native"
import { Input } from "~/components/ui/Input"
import { toast } from "~/components/ui/Toast"
import { SpotClusterMarker } from "~/components/SpotMarker"
import { Button } from "~/components/ui/Button"
import { useMapFilters } from "../../(map)/filters"
import { AddTripSpotPreview } from "~/components/AddTripSpotPreview"
import { ModalView } from "~/components/ui/ModalView"

type Cluster = RouterOutputs["spot"]["clusters"][number]

export default function NewItemScreen() {
  const router = useRouter()
  const { id, order } = useLocalSearchParams<{ id: string; order: string }>()
  const filters = useMapFilters((s) => s.filters)

  const [coords, setCoords] = React.useState<number[] | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const [clusters, setClusters] = React.useState<Cluster[] | null>(null)
  const [activeSpotId, setActiveSpotId] = React.useState<string | null>(null)

  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)
  const utils = api.useUtils()

  const {
    data: geocodeData,
    isLoading: addressLoading,
    isFetching,
  } = api.mapbox.geocodeCoords.useQuery(
    { latitude: coords?.[1]!, longitude: coords?.[0]! },
    { enabled: !!coords?.[0] && !!coords?.[1], keepPreviousData: true },
  )
  const isUnknownAddress = !!!geocodeData?.place
  const { data: geocodedCoords } = api.mapbox.geocodeAddress.useQuery({ address: search }, { enabled: !!search })

  React.useEffect(() => {
    if (!geocodedCoords) return
    camera.current?.setCamera({
      zoomLevel: 9,
      animationDuration: 1000,
      animationMode: "flyTo",
      centerCoordinate: [geocodedCoords[0], geocodedCoords[1]],
    })
  }, [geocodedCoords])

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
    try {
      setIsLoading(true)
      if (!properties.bounds) return
      const input = {
        ...filters,
        minLng: properties.bounds.sw[0] || 0,
        minLat: properties.bounds.sw[1] || 0,
        maxLng: properties.bounds.ne[0] || 0,
        maxLat: properties.bounds.ne[1] || 0,
        zoom: properties.zoom,
      }

      void utils.spot.clusters.fetch(input).then(setClusters)
      setCoords(properties.center)
    } catch {
      toast({ title: "Error fetching spots", type: "error" })
      console.log("oops - fetching clusters on map move")
    } finally {
      setIsLoading(false)
    }
  }

  const spotMarkers = React.useMemo(
    () =>
      clusters?.map((point, i) => (
        <SpotClusterMarker
          point={point}
          key={i}
          onPress={() => {
            camera.current?.setCamera({
              zoomLevel: (point.properties.cluster && point.properties.zoomLevel) || undefined,
              animationMode: "linearTo",
              animationDuration: 300,
              centerCoordinate: point.geometry.coordinates,
              padding: { paddingBottom: activeSpotId ? 345 : 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
            })
            if (!point.properties.cluster) {
              setActiveSpotId(point.properties.id)
            }
          }}
        />
      )),
    // dont add activeSpotId here
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clusters],
  )

  const { mutate, isLoading: createLoading } = api.trip.saveStop.useMutation({
    onSuccess: () => {
      void utils.trip.detail.refetch()
      router.back()
    },
  })

  const handleCreateTripStop = () => {
    if (!geocodeData?.place) return
    if (!coords) return toast({ title: "Please select a location" })
    mutate({
      tripId: id,
      name: geocodeData.place,
      latitude: coords[1]!,
      longitude: coords[0]!,
      order: order ? Number(order) : undefined,
    })
  }

  return (
    <ModalView title="add stop">
      <View className="mb-2 flex w-full flex-row items-center space-x-1 overflow-hidden">
        {addressLoading || isFetching ? (
          <Spinner size="small" />
        ) : (
          <Icon
            icon={isUnknownAddress ? AlertTriangle : MapPinned}
            size={20}
            color={isUnknownAddress ? "primary" : undefined}
            className={join(!!!isUnknownAddress && "opacity-80")}
          />
        )}
        <Text numberOfLines={1} className="flex-1 text-sm opacity-70">
          {addressLoading ? "" : geocodeData?.place || "Unknown address - move map to set"}
        </Text>
      </View>
      {!isLoading && (
        <View className="relative flex-1">
          <Map
            className="rounded-xs overflow-hidden"
            onLayout={handleSetUserLocation}
            onMapIdle={onMapMove}
            ref={mapRef}
            styleURL={StyleURL.SatelliteStreet}
            compassPosition={{ top: 54, right: 8 }}
            onPress={() => setActiveSpotId(null)}
          >
            <UserLocation />

            <Camera ref={camera} allowUpdates defaultSettings={{ zoomLevel: 9, pitch: 0, heading: 0 }} />
            {spotMarkers}
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

          {!!!activeSpotId && (
            <View
              style={{ transform: [{ translateX: -15 }, { translateY: -15 }] }}
              className="absolute left-1/2 top-1/2 flex items-center justify-center"
            >
              <Icon icon={CircleDot} size={30} color="white" />
            </View>
          )}
          <View
            pointerEvents="box-none"
            className="absolute bottom-5 left-5 right-5 flex flex-row items-center justify-between space-y-2"
          >
            <Link push href={`/filters`} asChild>
              <TouchableOpacity
                activeOpacity={0.8}
                className="sq-12 bg-background dark:bg-background-dark flex flex-row items-center justify-center rounded-full"
              >
                <Icon icon={Settings2} size={20} />
              </TouchableOpacity>
            </Link>
            <Button
              className="bg-background rounded-full"
              textClassName="text-black"
              onPress={() => {
                if (!coords || !geocodeData || isUnknownAddress) return
                if (!coords[0] || !coords[1]) return toast({ title: "Please select a location" })
                handleCreateTripStop()
              }}
              disabled={!coords || (coords && (!coords[0] || !coords[1])) || !geocodeData || isUnknownAddress}
              isLoading={createLoading}
            >
              Add to trip
            </Button>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSetUserLocation}
              className="sq-12 bg-background flex flex-row items-center justify-center rounded-full"
            >
              <Navigation size={20} className="text-black" />
            </TouchableOpacity>
          </View>

          {activeSpotId && <AddTripSpotPreview spotId={activeSpotId} tripId={id} onClose={() => setActiveSpotId(null)} />}
        </View>
      )}
    </ModalView>
  )
}
