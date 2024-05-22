import { BIOREGIONS, type BioRegion, INITIAL_LATITUDE, INITIAL_LONGITUDE, createAssetUrl, join } from "@ramble/shared"
import {
  Camera,
  LocationPuck,
  type MapState,
  type MapView as MapType,
  MarkerView,
  RasterLayer,
  RasterSource,
} from "@rnmapbox/maps"
import { keepPreviousData } from "@tanstack/react-query"
import * as Location from "expo-location"
import { Link, useRouter } from "expo-router"
import { Layers, Navigation, PlusCircle, Settings2, User } from "lucide-react-native"
import * as React from "react"
import { TouchableOpacity, View, useColorScheme } from "react-native"
import { BioRegionPreview } from "~/components/BioRegionPreview"
import { FeedbackCheck, useFeedbackActivity } from "~/components/FeedbackCheck"
import { Icon } from "~/components/Icon"
import { MapView } from "~/components/Map"
import { MapSearch } from "~/components/MapSearch"
import { RegisterCheck } from "~/components/RegisterCheck"
import { SpotClusterMarker } from "~/components/SpotMarker"
import { SpotPreview } from "~/components/SpotPreview"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useMapSettings } from "~/lib/hooks/useMapSettings"
import { useMe } from "~/lib/hooks/useMe"
import { useMapFilters } from "../../../filters"
import { useMapLayers } from "./layers"

export default function MapScreen() {
  return (
    <View className="flex-1">
      <RegisterCheck />
      <FeedbackCheck />
      <MapContainer />
    </View>
  )
}

function MapContainer() {
  const router = useRouter()
  const increment = useFeedbackActivity((s) => s.increment)
  const [activeSpotId, setActiveSpotId] = React.useState<string | null>(null)
  const handleClosePreview = React.useCallback(() => setActiveSpotId(null), [])

  const { me } = useMe()
  const { mutate: updateUser } = api.user.update.useMutation()
  const layers = useMapLayers((s) => s.layers)
  const isDark = useColorScheme() === "dark"
  const [isMapLoaded, setIsMapLoaded] = React.useState(false)
  const [selectedBioRegion, setSelectedBioRegion] = React.useState<BioRegion | null>(null)
  const handleCloseBioRegionPreview = React.useCallback(() => setSelectedBioRegion(null), [])

  const [mapSettings, setMapSettings] = useMapSettings()

  const filters = useMapFilters((s) => s.filters)
  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)

  const {
    data: clusters,
    isLoading: spotsLoading,
    isRefetching,
  } = api.spot.clusters.useQuery(mapSettings ? { ...mapSettings, ...filters } : undefined, {
    enabled: !!mapSettings,
    placeholderData: keepPreviousData,
  })
  const { data: users } = api.user.clusters.useQuery(mapSettings ? mapSettings : undefined, {
    enabled: !!mapSettings && layers.shouldShowUsers,
    placeholderData: keepPreviousData,
  })

  const handleSetUserLocation = async () => {
    try {
      setIsMapLoaded(true)
      const loc = await Location.getLastKnownPositionAsync()
      if (!loc) return
      camera.current?.setCamera({
        animationDuration: 0,
        animationMode: "none",
        centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
      })
      if (!me) return
      const randomVariant = Math.random() * (0.03 - 0.02) + 0.02 * (Math.random() > 0.5 ? 1 : -1)
      updateUser({
        latitude: Number(loc.coords.latitude) + randomVariant,
        longitude: Number(loc.coords.longitude) + randomVariant,
      })
    } catch {
      console.log("oops -  setting location")
    }
  }
  React.useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") return
      } catch {
        console.log("oops -  getting location")
      }
    })()
  }, [])

  React.useEffect(() => {
    if (!isMapLoaded) return
    async function updateMapAfterFiltersChange() {
      try {
        if (!mapRef.current) return
        const properties = await mapRef.current?.getVisibleBounds()
        const zoom = await mapRef.current?.getZoom()
        if (!properties) return
        setMapSettings({
          minLng: properties[1][0],
          minLat: properties[1][1],
          maxLng: properties[0][0],
          maxLat: properties[0][1],
          zoom: zoom || 13,
        })
      } catch {
        toast({ title: "Error fetching spots", type: "error" })
        console.log("oops - fetching clusters on filter")
      }
    }
    updateMapAfterFiltersChange()
  }, [isMapLoaded, setMapSettings])

  const onMapMove = async ({ properties }: MapState) => {
    if (!properties.bounds) return
    setMapSettings({
      minLng: properties.bounds.sw[0] || 0,
      minLat: properties.bounds.sw[1] || 0,
      maxLng: properties.bounds.ne[0] || 0,
      maxLat: properties.bounds.ne[1] || 0,
      zoom: properties.zoom,
    })
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: dont add activeSpotId here
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
              padding: { paddingBottom: activeSpotId ? 430 : 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
            })
            if (!point.properties.cluster) {
              increment()
              setSelectedBioRegion(null)
              setActiveSpotId(point.properties.id)
            }
          }}
        />
      )),
    [clusters],
  )
  // biome-ignore lint/correctness/useExhaustiveDependencies: dont need to re-render
  const userMarkers = React.useMemo(
    () =>
      layers.shouldShowUsers &&
      users?.map((point, i) => {
        if (point.properties.cluster) {
          const onPress = async () => {
            camera.current?.setCamera({
              zoomLevel: (point.properties.cluster && point.properties.zoomLevel) || undefined,
              animationMode: "linearTo",
              animationDuration: 300,
              centerCoordinate: point.geometry.coordinates,
              padding: { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
            })
          }
          return (
            <MarkerView key={`${point.id || 0}${i}`} allowOverlap allowOverlapWithPuck coordinate={point.geometry.coordinates}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPress}
                className={join(
                  "flex items-center justify-center rounded-full border border-primary-100 bg-primary-700",
                  point.properties.point_count > 150
                    ? "sq-20"
                    : point.properties.point_count > 75
                      ? "sq-16"
                      : point.properties.point_count > 10
                        ? "sq-12"
                        : "sq-8",
                )}
              >
                <Text className="text-center text-sm text-white">{point.properties.point_count_abbreviated}</Text>
              </TouchableOpacity>
            </MarkerView>
          )
        }

        const user = point.properties as {
          cluster: false
          username: string
          id: string
          avatar: string | null
          avatarBlurHash: string | null
        }
        return (
          <MarkerView key={user.id} allowOverlap allowOverlapWithPuck coordinate={point.geometry.coordinates}>
            <TouchableOpacity
              activeOpacity={me ? 0.7 : 0}
              onPress={() => {
                increment()
                if (!me) return
                router.push(`/(home)/(index)/${user.username}/(profile)`)
              }}
              className="sq-8 flex items-center justify-center overflow-hidden rounded-full border border-primary-200 bg-primary-700"
            >
              {user.avatar ? (
                <OptimizedImage
                  width={50}
                  height={50}
                  placeholder={user.avatarBlurHash}
                  style={{ width: 32, height: 32 }}
                  source={{ uri: createAssetUrl(user.avatar) }}
                  className="object-cover"
                />
              ) : (
                <Icon icon={User} size={16} color="white" />
              )}
            </TouchableOpacity>
          </MarkerView>
        )
      }),
    [users, layers.shouldShowUsers],
  )

  const onRegionPress = async (e: GeoJSON.Feature) => {
    const { screenPointX, screenPointY } = e.properties as { screenPointX: number; screenPointY: number }
    const currentMap = mapRef.current
    if (!currentMap) return
    const featureCollection = await currentMap.queryRenderedFeaturesAtPoint([screenPointX, screenPointY])
    const features = featureCollection?.features
    if (!features || features.length === 0) return
    const layerNames = features.map((feature) => feature?.properties?.short_name)
    const selectedBioRegion = Object.keys(BIOREGIONS).find((bioRegion) => layerNames.includes(bioRegion)) as BioRegion
    if (!selectedBioRegion) return
    setActiveSpotId(null)
    setSelectedBioRegion(selectedBioRegion)
  }

  return (
    <>
      <MapView
        onDidFinishLoadingMap={handleSetUserLocation}
        onMapIdle={onMapMove}
        onPress={
          layers.layer === "bioRegions" ? (selectedBioRegion ? handleCloseBioRegionPreview : onRegionPress) : handleClosePreview
        }
        ref={mapRef}
        styleURL={
          layers.layer === "rain" || layers.layer === "temp"
            ? `mapbox://styles/mapbox/${isDark ? "dark" : "light"}-v11`
            : layers.layer === "satellite"
              ? "mapbox://styles/mapbox/satellite-streets-v12"
              : layers.layer === "bioRegions"
                ? isDark
                  ? "mapbox://styles/jclackett/clvz84gzh015v01pccwv7bcnj"
                  : "mapbox://styles/jclackett/clvxvin5p02a301qv6waq1fhg"
                : undefined
        }
      >
        <LocationPuck />

        <MapLayers />
        <Camera
          ref={camera}
          allowUpdates
          followUserLocation={false}
          minZoomLevel={layers.layer === "bioRegions" ? 5 : 0}
          defaultSettings={{ centerCoordinate: [INITIAL_LONGITUDE, INITIAL_LATITUDE], zoomLevel: 8, pitch: 0, heading: 0 }}
        />

        {userMarkers}
        {spotMarkers}
      </MapView>

      {(spotsLoading || isRefetching) && (
        <View
          pointerEvents="none"
          className="absolute shadow top-14 right-4 flex flex-col items-center justify-center rounded-full bg-white p-2 dark:bg-gray-800"
        >
          <Spinner />
        </View>
      )}

      <MapSearch
        onSearch={(center) => {
          camera.current?.setCamera({ animationDuration: 600, zoomLevel: 14, centerCoordinate: center })
        }}
      />
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          increment()
          router.push("/new/")
        }}
        style={{ transform: [{ translateX: -26 }] }}
        className="absolute shadow bottom-3 left-1/2 rounded-full bg-primary p-4"
      >
        <Icon icon={PlusCircle} size={20} color="white" />
      </TouchableOpacity>

      <View pointerEvents="box-none" className="absolute bottom-3 left-3 flex space-y-2">
        <Link push href={"/layers"} asChild>
          <TouchableOpacity
            onPress={() => increment()}
            activeOpacity={0.8}
            className="sq-12 shadow flex flex-row items-center justify-center rounded-full bg-background dark:bg-background-dark"
          >
            <Icon icon={Layers} size={20} />
          </TouchableOpacity>
        </Link>
        <Link push href={"/filters"} asChild>
          <TouchableOpacity
            onPress={() => increment()}
            activeOpacity={0.8}
            className="sq-12 shadow flex flex-row items-center justify-center rounded-full bg-background dark:bg-background-dark"
          >
            <Icon icon={Settings2} size={20} />
          </TouchableOpacity>
        </Link>
      </View>
      <TouchableOpacity
        onPress={handleSetUserLocation}
        className="sq-12 shadow absolute right-3 bottom-3 flex flex-row items-center justify-center rounded-full bg-background dark:bg-background-dark"
      >
        <Icon icon={Navigation} size={20} />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          increment()
          router.push("/new/")
        }}
        style={{ transform: [{ translateX: -26 }] }}
        className="absolute bottom-3 left-1/2 shadow rounded-full bg-primary p-4"
      >
        <Icon icon={PlusCircle} size={20} color="white" />
      </TouchableOpacity>

      <View pointerEvents="box-none" className="absolute bottom-3 left-3 flex space-y-2">
        <Link push href={"/layers"} asChild>
          <TouchableOpacity
            onPress={() => increment()}
            activeOpacity={0.8}
            className="sq-12 flex flex-row items-center shadow justify-center rounded-full bg-background dark:bg-background-dark"
          >
            <Icon icon={Layers} size={20} />
          </TouchableOpacity>
        </Link>
        <Link push href={"/filters"} asChild>
          <TouchableOpacity
            onPress={() => increment()}
            activeOpacity={0.8}
            className="sq-12 flex flex-row items-center shadow justify-center rounded-full bg-background dark:bg-background-dark"
          >
            <Icon icon={Settings2} size={20} />
          </TouchableOpacity>
        </Link>
      </View>
      {activeSpotId && <SpotPreview id={activeSpotId} onClose={handleClosePreview} />}
      {selectedBioRegion && <BioRegionPreview id={selectedBioRegion} onClose={handleCloseBioRegionPreview} />}
    </>
  )
}

function MapLayers() {
  const layers = useMapLayers((s) => s.layers)

  return (
    <>
      <RasterSource
        id="temp"
        tileSize={256}
        tileUrlTemplates={["https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=0937eef5e79a9078196f43c47db32b63"]}
      />
      {layers.layer === "temp" && <RasterLayer id="tempLayer" sourceID="temp" style={{ rasterOpacity: 1 }} />}

      <RasterSource
        id="rain"
        tileSize={256}
        tileUrlTemplates={[
          "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=0937eef5e79a9078196f43c47db32b63",
        ]}
      />
      {layers.layer === "rain" && <RasterLayer id="rainLayer" sourceID="rain" style={{ rasterOpacity: 1 }} />}
    </>
  )
}
