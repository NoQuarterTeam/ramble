import { Camera, type MapState, type MapView as MapType, UserLocation } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Navigation } from "lucide-react-native"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"

import { Icon } from "~/components/Icon"
import { MapView } from "~/components/Map"
import { SpotClusterMarker } from "~/components/SpotMarker"
import { SpotPreview } from "~/components/SpotPreview"
import { Button } from "~/components/ui/Button"
import { Spinner } from "~/components/ui/Spinner"
import { toast } from "~/components/ui/Toast"
import { type RouterOutputs, api } from "~/lib/api"
import { isAndroid } from "~/lib/device"

type Cluster = RouterOutputs["list"]["spotClusters"][number]

export default function ListDetailMapScreen() {
  const params = useLocalSearchParams<{ id: string; initialBounds?: string; initialCenter?: string }>()
  const [clusters, setClusters] = React.useState<Cluster[] | null>(null)
  const [isFetching, setIsFetching] = React.useState(true)
  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)

  const router = useRouter()

  const handleSetUserLocation = async () => {
    try {
      const loc = await Location.getLastKnownPositionAsync()
      if (!loc) return
      camera.current?.setCamera({
        animationDuration: 0,
        animationMode: "none",
        centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
      })
    } catch {
      console.log("oops -  setting location")
    }
  }

  React.useEffect(() => {
    ;(async () => {
      try {
        await Location.requestForegroundPermissionsAsync()
      } catch {
        console.log("oops -  getting location")
      }
    })()
  }, [])

  const [activeSpotId, setActiveSpotId] = React.useState<string | null>(null)

  const utils = api.useUtils()
  const onMapMove = async ({ properties }: MapState) => {
    try {
      setIsFetching(true)
      if (!properties.bounds) return
      const input = {
        minLng: properties.bounds.sw[0] || 0,
        minLat: properties.bounds.sw[1] || 0,
        maxLng: properties.bounds.ne[0] || 0,
        maxLat: properties.bounds.ne[1] || 0,
        zoom: properties.zoom,
      }
      const data = await utils.list.spotClusters.fetch({ id: params.id, ...input })
      setClusters(data)
    } catch {
      toast({ title: "Error fetching spots", type: "error" })
      console.log("oops - fetching clusters on map move")
    } finally {
      setIsFetching(false)
    }
  }

  const spotMarkers = React.useMemo(
    () =>
      clusters?.map((point, i) => (
        <SpotClusterMarker
          point={point}
          key={`${point.id || 0}${i}`}
          onPress={() => {
            camera.current?.setCamera({
              zoomLevel: (point.properties.cluster && point.properties.zoomLevel) || undefined,
              animationMode: "linearTo",
              animationDuration: 300,
              centerCoordinate: point.geometry.coordinates,
              padding: { paddingBottom: point.properties.cluster ? 0 : 300, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
            })
            if (!point.properties.cluster) {
              setActiveSpotId(point.properties.id)
            }
          }}
        />
      )),
    [clusters],
  )

  const initialBounds = params.initialBounds?.split(",").map(Number)
  const initialCenter = params.initialCenter?.split(",").map(Number)

  return (
    <View className="relative flex-1">
      <MapView onMapIdle={onMapMove} onPress={() => setActiveSpotId(null)} ref={mapRef}>
        <UserLocation />
        {spotMarkers}

        <Camera
          ref={camera}
          allowUpdates
          defaultSettings={
            initialCenter
              ? { pitch: 0, heading: 0, centerCoordinate: initialCenter, zoomLevel: 5 }
              : initialBounds
                ? {
                    pitch: 0,
                    heading: 0,
                    bounds: {
                      paddingBottom: 50,
                      paddingTop: 50,
                      paddingLeft: 50,
                      paddingRight: 50,
                      sw: [initialBounds[0]!, initialBounds[1]!],
                      ne: [initialBounds[2]!, initialBounds[3]!],
                    },
                  }
                : undefined
          }
        />
      </MapView>
      {activeSpotId && <SpotPreview id={activeSpotId} onClose={() => setActiveSpotId(null)} />}
      <View pointerEvents="box-none" className="absolute bottom-4 flex w-full flex-row items-center justify-center">
        <Button onPress={router.back} className="rounded-full" size="sm">
          View list
        </Button>
      </View>
      {!!isAndroid && isFetching && (
        <View
          pointerEvents="none"
          className="absolute left-4 top-10 flex flex-col items-center justify-center rounded-full bg-white p-2 dark:bg-gray-800"
        >
          <Spinner />
        </View>
      )}

      <TouchableOpacity
        onPress={handleSetUserLocation}
        className="sq-12 bg-background absolute bottom-3 right-3 flex flex-row items-center justify-center rounded-full"
      >
        <Icon icon={Navigation} size={20} color="black" />
      </TouchableOpacity>
    </View>
  )
}
