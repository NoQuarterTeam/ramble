import { Camera, UserLocation, type MapState, type MapView as MapType } from "@rnmapbox/maps"
import * as Location from "expo-location"
import { Navigation } from "lucide-react-native"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"

import { Icon } from "../../../../../components/Icon"
import { Map } from "../../../../../components/Map"
import { SpotClusterMarker } from "../../../../../components/SpotMarker"
import { Button } from "../../../../../components/ui/Button"
import { Spinner } from "../../../../../components/ui/Spinner"
import { toast } from "../../../../../components/ui/Toast"
import { api, type RouterOutputs } from "../../../../../lib/api"
import { useParams, useRouter } from "../../../../router"
import { SpotPreview } from "../../../map/SpotPreview"

type Cluster = RouterOutputs["list"]["spotClusters"][number]

export function ListDetailMapScreen() {
  const { params } = useParams<"ListDetailMapScreen">()
  const [clusters, setClusters] = React.useState<Cluster[] | null>(null)
  const [isFetching, setIsFetching] = React.useState(true)
  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)

  const navigate = useRouter()

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
          key={i}
          onPress={() => {
            camera.current?.setCamera({
              zoomLevel: (point.properties.cluster && point.properties.zoomLevel) || undefined,
              animationMode: "linearTo",
              animationDuration: 300,
              centerCoordinate: point.geometry.coordinates,
              padding: { paddingBottom: activeSpotId ? 300 : 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
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

  return (
    <View className="relative flex-1">
      <Map onMapIdle={onMapMove} onPress={() => setActiveSpotId(null)} ref={mapRef}>
        <UserLocation />
        {spotMarkers}

        <Camera
          ref={camera}
          allowUpdates
          defaultSettings={
            params.initialCenter
              ? { centerCoordinate: params.initialCenter, zoomLevel: 5 }
              : params.initialBounds
                ? {
                    bounds: {
                      paddingBottom: 50,
                      paddingTop: 50,
                      paddingLeft: 50,
                      paddingRight: 50,
                      sw: [params.initialBounds[0], params.initialBounds[1]],
                      ne: [params.initialBounds[2], params.initialBounds[3]],
                    },
                  }
                : undefined
          }
        />
      </Map>
      {activeSpotId && <SpotPreview id={activeSpotId} onClose={() => setActiveSpotId(null)} />}
      <View pointerEvents="box-none" className="absolute bottom-4 flex w-full flex-row items-center justify-center">
        <Button
          onPress={() => (navigate.canGoBack() ? navigate.goBack() : navigate.push("ListDetailScreen", params))}
          className="rounded-full"
          size="sm"
        >
          View list
        </Button>
      </View>
      {isFetching && (
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
