import { useActionSheet } from "@expo/react-native-action-sheet"
import type { MediaType } from "@ramble/database/types"
import {
  Camera,
  LineLayer,
  LocationPuck,
  type MapState,
  type MapView as MapType,
  MarkerView,
  ShapeSource,
  StyleURL,
} from "@rnmapbox/maps"
import * as Sentry from "@sentry/react-native"
import dayjs from "dayjs"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import * as Location from "expo-location"
import * as MediaLibrary from "expo-media-library"
import * as Network from "expo-network"
import { Link, useLocalSearchParams, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import * as VideoThumbnails from "expo-video-thumbnails"
import { ChevronLeft, Edit2, Flag, Home, Image as ImageIcon, MapPin, Plus, Users } from "lucide-react-native"
import * as React from "react"
import { ActivityIndicator, Alert, Linking, TouchableOpacity, View } from "react-native"
import DraggableFlatList, { type RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as DropdownMenu from "zeego/dropdown-menu"

import { INITIAL_LATITUDE, INITIAL_LONGITUDE, createAssetUrl, join } from "@ramble/shared"

import { keepPreviousData } from "@tanstack/react-query"
import { Icon } from "~/components/Icon"
import { LoginPlaceholder } from "~/components/LoginPlaceholder"
import { MapView } from "~/components/Map"
import { SpotIcon } from "~/components/SpotIcon"
import { SpotMarker } from "~/components/SpotMarker"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { ScreenView } from "~/components/ui/ScreenView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { type RouterOutputs, api } from "~/lib/api"
import { useMapCoords } from "~/lib/hooks/useMapCoords"
import { useMapSettings } from "~/lib/hooks/useMapSettings"
import { useMe } from "~/lib/hooks/useMe"
import { useS3QuickUpload } from "~/lib/hooks/useS3"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

export default function TripDetailScreen() {
  const { me } = useMe()
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data, isLoading } = api.trip.detail.useQuery({ id })
  const trip = data?.trip
  const bounds = data?.bounds
  const center = data?.center
  const utils = api.useUtils()

  const router = useRouter()

  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)

  const [userLocation, setUserLocation] = React.useState<Location.LocationObject["coords"] | null>(null)
  React.useEffect(() => {
    Location.getLastKnownPositionAsync()
      .then((loc) => {
        if (!loc) return
        setUserLocation(loc.coords)
      })
      .catch(() => {
        //
      })
  }, [])
  const tab = useTabSegment()
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions()

  React.useEffect(() => {
    if (!me?.tripSyncEnabled || !permissionResponse || !trip) return
    const isTripActive = dayjs(trip.startDate).isBefore(dayjs()) && dayjs(trip.endDate).isAfter(dayjs())
    if (!isTripActive) return
    if (permissionResponse?.granted) return
    if (permissionResponse?.canAskAgain) {
      requestPermission().catch()
    } else {
      Alert.alert(
        "Photo library permissions required for syncing",
        "Please go to your phone's settings to grant media library permissions for Ramble",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open settings", onPress: Linking.openSettings },
        ],
      )
    }
  }, [trip, me?.tripSyncEnabled, permissionResponse, requestPermission])

  // biome-ignore lint/correctness/useExhaustiveDependencies: dont rerender
  const itemMarkers = React.useMemo(
    () =>
      trip?.items.map(
        (item) =>
          (item.spot || item.stop) && (
            <MarkerView
              allowOverlap
              allowOverlapWithPuck
              key={item.id}
              coordinate={item.spot ? [item.spot.longitude, item.spot.latitude] : [item.stop!.longitude, item.stop!.latitude]}
            >
              <TouchableOpacity
                activeOpacity={item.spot ? 0.8 : 1}
                onPressIn={item.spot?.id ? () => utils.spot.detail.prefetch({ id: item.spot!.id }) : undefined}
                onPress={item.spot ? () => router.push(`/${tab}/spot/${item.spot?.id}`) : undefined}
              >
                {item.spot ? <SpotMarker spot={item.spot} /> : <Icon icon={MapPin} size={24} fill="white" color="black" />}
              </TouchableOpacity>
            </MarkerView>
          ),
      ),
    [trip?.items, tab],
  )
  const setCoords = useMapCoords((s) => s.setCoords)

  const [mapSettings, setMapSettings] = useMapSettings()
  const { data: mediaClusters, refetch } = api.trip.media.clusters.useQuery(
    mapSettings ? { ...mapSettings, tripId: id } : undefined,
    { enabled: !!mapSettings, placeholderData: keepPreviousData },
  )

  const onMapMove = ({ properties }: MapState) => {
    if (!properties.bounds) return
    setCoords(properties.center)
    setMapSettings({
      minLng: properties.bounds.sw[0] || 0,
      minLat: properties.bounds.sw[1] || 0,
      maxLng: properties.bounds.ne[0] || 0,
      maxLat: properties.bounds.ne[1] || 0,
      zoom: properties.zoom,
    })
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: allow dat
  const mediaMarkers = React.useMemo(
    () =>
      mediaClusters?.map((point, i) => {
        if (point.properties.cluster) {
          const bounds = point.properties.bounds
          const properties = point.properties.media[0]?.properties
          const clusterImagePath = properties?.thumbnailPath || properties?.path
          return (
            <MarkerView key={`${point.id || 0}${i}`} allowOverlap allowOverlapWithPuck coordinate={point.geometry.coordinates}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/${tab}/trip/${id}/media/cluster?bounds=${bounds.join(",")}`)}
                className={join(
                  "relative flex items-center justify-center",
                  point.properties.point_count > 150 ? "sq-20" : point.properties.point_count > 75 ? "sq-16" : "sq-14",
                )}
              >
                <View className="h-full w-full rounded-sm border-2 border-white bg-background dark:bg-background-dark">
                  <Image source={{ uri: createAssetUrl(clusterImagePath) }} style={{ width: "100%", height: "100%" }} />
                </View>
                <View className="sq-5 -top-1 -right-1 absolute flex items-center justify-center rounded-full bg-blue-500">
                  <Text className="text-center font-600 text-white">{point.properties.point_count_abbreviated}</Text>
                </View>
              </TouchableOpacity>
            </MarkerView>
          )
        }
        const media = point.properties as {
          cluster: false
          path: string
          thumbnailPath: string | null
          id: string
        }
        const itemImagePath = media.thumbnailPath || media.path
        return (
          <MarkerView key={media.id} allowOverlap allowOverlapWithPuck coordinate={point.geometry.coordinates}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(`/${tab}/trip/${id}/media/${media.id}`)}
              className="sq-12 flex items-center justify-center overflow-hidden rounded-md border-2 border-white"
            >
              <Image source={{ uri: createAssetUrl(itemImagePath) }} style={{ width: "100%", height: "100%" }} />
            </TouchableOpacity>
          </MarkerView>
        )
      }),
    [mediaClusters, id],
  )

  const insets = useSafeAreaInsets()

  if (!me)
    return (
      <ScreenView title={trip?.name}>
        <LoginPlaceholder text="Log in to view this trip" />
      </ScreenView>
    )
  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <MapView ref={mapRef} styleURL={StyleURL.SatelliteStreet} compassPosition={{ top: 54, right: 12 }} onMapIdle={onMapMove}>
        {data?.line && (
          <ShapeSource id="directions" shape={data.line.geometry}>
            <LineLayer id="line" style={{ lineDasharray: [0.5, 2], lineColor: "white", lineCap: "round", lineWidth: 2 }} />
          </ShapeSource>
        )}
        {/* {data?.directions && (
            <ShapeSource id="directions" shape={data.directions.geometry}>
              <LineLayer id="line" style={{ lineDasharray: [0.5, 2], lineColor: "white", lineCap: "round", lineWidth: 2 }} />
            </ShapeSource>
          )} */}
        {itemMarkers}
        {mediaMarkers}
        <LocationPuck />

        <Camera
          ref={camera}
          allowUpdates
          pitch={0}
          heading={0}
          followUserLocation={false}
          defaultSettings={
            center
              ? {
                  padding: {
                    paddingTop: insets.top + 8 + 32,
                    paddingBottom: LIST_HEIGHT,
                    paddingLeft: 50,
                    paddingRight: 50,
                  },
                  centerCoordinate: center,
                  zoomLevel: 5,
                }
              : bounds
                ? {
                    padding: {
                      paddingTop: insets.top + 8 + 32,
                      paddingBottom: LIST_HEIGHT,
                      paddingLeft: 50,
                      paddingRight: 50,
                    },
                    zoomLevel: 5,
                    bounds: { sw: [bounds[0]!, bounds[1]!], ne: [bounds[2]!, bounds[3]!] },
                  }
                : {
                    zoomLevel: 3,
                    centerCoordinate: userLocation
                      ? [userLocation.longitude, userLocation.latitude]
                      : [INITIAL_LONGITUDE, INITIAL_LATITUDE],
                  }
          }
        />
      </MapView>

      <View style={{ top: insets.top + 8 }} pointerEvents="box-none" className="absolute right-0 left-0 flex">
        <View className="flex flex-row items-center justify-between px-4">
          <View className="flex flex-row items-center space-x-2 flex-1">
            <TouchableOpacity
              onPress={router.back}
              activeOpacity={0.5}
              className="sq-8 just flex h-10 w-10 flex-row items-center justify-center rounded-full bg-background dark:bg-background-dark"
            >
              <Icon icon={ChevronLeft} />
            </TouchableOpacity>
            <View className="flex h-10 flex-row items-center rounded-full bg-background dark:bg-background-dark">
              {isLoading ? (
                <View className="flex w-10 items-center justify-center">
                  <ActivityIndicator />
                </View>
              ) : (
                <View className="flex items-center justify-center px-4">
                  <Text className="text-base" numberOfLines={1}>
                    {trip?.name}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {trip && me && (
            <View className="flex flex-row items-center space-x-1 justify-end flex-1">
              <Link push href={`/${tab}/trip/${id}/media`} asChild>
                <TouchableOpacity
                  className="sq-10 flex items-center justify-center rounded-full bg-background dark:bg-background-dark"
                  activeOpacity={0.8}
                >
                  <Icon icon={ImageIcon} size={16} />
                </TouchableOpacity>
              </Link>

              <Link push href={`/${tab}/trip/${id}/users`} asChild>
                <TouchableOpacity
                  className="sq-10 flex items-center justify-center rounded-full bg-background dark:bg-background-dark"
                  activeOpacity={0.8}
                >
                  <Icon icon={Users} size={16} />
                </TouchableOpacity>
              </Link>
              <Link push href={`/${tab}/trip/${id}/edit`} asChild>
                <TouchableOpacity
                  className="sq-10 flex items-center justify-center rounded-full bg-background dark:bg-background-dark"
                  activeOpacity={0.8}
                >
                  <Icon icon={Edit2} size={16} />
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </View>
        {me.tripSyncEnabled && permissionResponse?.granted && data && (
          <TripImageSync
            startDate={data.trip.startDate}
            endDate={data.trip.endDate}
            latestMediaTimestamp={data.latestMediaTimestamp}
            onDone={refetch}
          />
        )}
      </View>

      <View className="absolute right-0 bottom-0 left-0">
        {trip && (
          <TripList
            trip={trip}
            onScrollEnd={(index) => {
              const item = trip.items[index]
              if (!item) return
              const coords = item.spot
                ? [item.spot.longitude, item.spot.latitude]
                : item.stop
                  ? [item.stop.longitude, item.stop.latitude]
                  : undefined
              if (!coords) return
              camera.current?.setCamera({
                animationMode: "linearTo",
                animationDuration: 300,
                padding: { paddingBottom: LIST_HEIGHT, paddingLeft: 0, paddingRight: 0, paddingTop: insets.top },
                centerCoordinate: coords,
              })
            }}
          />
        )}
      </View>
    </View>
  )
}

function TripImageSync({
  startDate,
  endDate,
  latestMediaTimestamp,
  onDone,
}: { startDate: Date; endDate: Date; latestMediaTimestamp: Date | undefined; onDone: () => void }) {
  const { id } = useLocalSearchParams<{ id: string }>()
  const utils = api.useUtils()

  const { me } = useMe()
  const upload = useS3QuickUpload()

  const { mutate: uploadMedia } = api.trip.media.upload.useMutation({
    onSuccess: (timestamp) => {
      utils.trip.detail.setData({ id }, (prev) => (prev ? { ...prev, latestMediaTimestamp: timestamp } : prev))
    },
  })
  const [isSyncing, setIsSyncing] = React.useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: allow it
  React.useEffect(() => {
    async function loadMedia() {
      if (!me) return
      const isTripActive = dayjs(startDate).isBefore(dayjs()) && dayjs(endDate).isAfter(dayjs())
      if (!isTripActive) return
      const networkState = await Network.getNetworkStateAsync()
      if (!networkState.isConnected) return toast({ title: "Syncing disabled", message: "No internet connection" })
      if (!me.tripSyncOnNetworkEnabled && networkState.type !== Network.NetworkStateType.WIFI) {
        return toast({ title: "Syncing disabled", message: "Not on wifi" })
      }

      try {
        setIsSyncing(true)
        const createdAfter = latestMediaTimestamp
          ? dayjs(latestMediaTimestamp)
              .add(1, "millisecond") // need this to make query exclude latest
              .toDate()
          : dayjs(startDate).startOf("day").toDate()
        const createdBefore = dayjs(endDate).endOf("day").toDate()
        const pages = await MediaLibrary.getAssetsAsync({
          createdAfter,
          createdBefore,
          mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
          sortBy: "creationTime",
        })
        if (pages.totalCount === 0) return
        let assets: MediaLibrary.Asset[] = pages.assets
        let endCursor = pages.endCursor
        while (true) {
          const newPages = await MediaLibrary.getAssetsAsync({
            after: endCursor,
            createdAfter,
            createdBefore,
            mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
            sortBy: "creationTime",
          })
          assets = assets.concat(newPages.assets)
          endCursor = newPages.endCursor
          if (!newPages.hasNextPage) break
        }
        const mediaToSync = []
        for (const asset of assets) {
          try {
            const info = await MediaLibrary.getAssetInfoAsync(asset)
            // if (!info.location) continue
            const type: MediaType = info.mediaType === MediaLibrary.MediaType.photo ? "IMAGE" : "VIDEO"
            const mediaWithData = {
              assetId: asset.id,
              url: info.localUri || asset.uri,
              latitude: info.location?.latitude,
              longitude: info.location?.longitude,
              timestamp: dayjs(asset.creationTime).toDate(),
              type,
              duration: info.duration || null,
            }
            mediaToSync.push(mediaWithData)
          } catch (error) {
            toast({ title: "Error syncing media", type: "error" })
            Sentry.captureException(error)
          }
        }
        if (mediaToSync.length === 0) return
        for (const media of mediaToSync) {
          try {
            let thumbnailPath = null
            if (media.type === "VIDEO") {
              const { uri } = await VideoThumbnails.getThumbnailAsync(media.url, { time: 0 })
              thumbnailPath = await upload(uri)
            }
            const path = await upload(media.url)
            const payload = { path, thumbnailPath, ...media }
            uploadMedia({ tripId: id, media: payload })
          } catch (error) {
            toast({ title: "Error syncing media", type: "error" })
            Sentry.captureException(error)
          }
        }
        onDone()
      } catch (error) {
        Sentry.captureException(error)
        toast({ title: "Error syncing media", type: "error" })
      } finally {
        setIsSyncing(false)
      }
    }
    loadMedia()
  }, [me, startDate, endDate, latestMediaTimestamp, id])
  if (!isSyncing) return null
  return (
    <View className="flex items-center justify-center pt-2">
      <View className="flex flex-row items-center space-x-2 rounded-full bg-primary px-4 py-2">
        <ActivityIndicator size="small" color="white" />
        <Text className="text-white">Syncing media</Text>
      </View>
    </View>
  )
}

type Item = RouterOutputs["trip"]["detail"]["trip"]["items"][number]

const LIST_HEIGHT = 130

function TripList({
  trip,
  onScrollEnd,
}: {
  trip: RouterOutputs["trip"]["detail"]["trip"]
  onScrollEnd: (index: number) => void
}) {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [tripItems, setTripItems] = React.useState(trip.items)
  const utils = api.useUtils()
  const { mutate } = api.trip.updateOrder.useMutation({
    onSuccess: () => {
      void utils.trip.detail.refetch({ id })
    },
  })

  const [activeItemIndex, setActiveItemIndex] = React.useState<number | null>(null)
  const activeIndexRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    setTripItems(trip.items)
  }, [trip.items])

  return (
    <DraggableFlatList
      horizontal
      onDragEnd={async ({ to, data }) => {
        const movedItem = data[to]
        let isOutOfOrder = false
        if (movedItem?.date) {
          // checks if dates are in order
          const itemDates = data.map((item) => item.date).filter(Boolean) as Date[]
          const isSorted = itemDates.every(
            (date, i) => i === 0 || dayjs(date).isSame(itemDates[i - 1]) || dayjs(date).isAfter(itemDates[i - 1]),
          )
          if (!isSorted) {
            toast({ title: "Dates are not in order", message: "We have removed the date of this item" })
            isOutOfOrder = true
          }
        }
        setTripItems(data.map((item, i) => (i === to ? { ...item, date: null } : item)))
        mutate({ id, items: data.map((i) => i.id), itemDateResetId: isOutOfOrder && movedItem ? movedItem.id : undefined })
      }}
      onScrollOffsetChange={(x) => {
        if (x < 0) return
        const index = Math.floor(x / ITEM_WIDTH)
        if (index !== activeItemIndex && index !== activeIndexRef.current) {
          onScrollEnd(index)
          setActiveItemIndex(index)
          activeIndexRef.current = index
        }
      }}
      dragItemOverflow
      ListHeaderComponent={<ListHeader trip={trip} />}
      ListFooterComponent={<ListFooter trip={trip} />}
      className="py-3"
      style={{ height: LIST_HEIGHT }}
      contentContainerStyle={{ paddingRight: 60, paddingLeft: 12 }}
      data={tripItems}
      autoscrollThreshold={1}
      autoscrollSpeed={50}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      renderItem={(props) => {
        const index = props.getIndex() || 0
        const prevItem = tripItems[index - 1]
        return (
          <TripItem
            item={props.item}
            drag={props.drag}
            isActive={props.isActive}
            isFocused={index === activeItemIndex}
            addBeforeOrder={index === 0 ? -1 : prevItem ? (prevItem.order + props.item.order) / 2 : 0}
          />
        )
      }}
    />
  )
}

const ITEM_WIDTH = 170

const TripItem = React.memo(function _TripItem({
  item,
  isActive,
  isFocused,
  drag,
  addBeforeOrder,
}: {
  isFocused: boolean
  addBeforeOrder: number
} & Pick<RenderItemParams<Item>, "item" | "isActive" | "drag">) {
  const { id } = useLocalSearchParams<{ id: string }>()
  const spot = item.spot
  const stop = item.stop
  const utils = api.useUtils()
  const tab = useTabSegment()
  const router = useRouter()
  const { showActionSheetWithOptions } = useActionSheet()

  const { mutate } = api.trip.items.remove.useMutation({
    onSuccess: () => {
      void utils.trip.detail.refetch({ id })
    },
  })
  const handleOpenMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (item.spot) {
      const options = ["View", "Set date", "Remove", "Cancel"]
      const viewIndex = 0
      const editIndex = 1
      const destructiveButtonIndex = 2
      const cancelButtonIndex = 3
      showActionSheetWithOptions({ options, cancelButtonIndex, destructiveButtonIndex }, (selectedIndex) => {
        switch (selectedIndex) {
          case viewIndex:
            router.push(`/${tab}/spot/${item.spot!.id}`)
            break
          case editIndex:
            router.push(`/${tab}/trip/${id}/items/${item.id}?date=${item.date?.toISOString() || ""}`)
            break
          case destructiveButtonIndex:
            mutate({ id: item.id })
            break
          case cancelButtonIndex:
            // Canceled
            break
        }
      })
    } else {
      const options = ["Set date", "Remove", "Cancel"]
      const editIndex = 0
      const destructiveButtonIndex = 1
      const cancelButtonIndex = 2
      showActionSheetWithOptions({ options, cancelButtonIndex, destructiveButtonIndex }, (selectedIndex) => {
        switch (selectedIndex) {
          case editIndex:
            router.push(`/${tab}/trip/${id}/items/${item.id}?date=${item.date?.toISOString() || ""}`)
            break
          case destructiveButtonIndex:
            mutate({ id: item.id })
            break
          case cancelButtonIndex:
            // Canceled
            break
        }
      })
    }
  }

  return (
    <ScaleDecorator>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleOpenMenu}
        onPressIn={() => {
          if (spot) void utils.spot.detail.prefetch({ id: spot.id })
        }}
        onLongPress={drag}
        className="flex flex-row items-center space-x-2 pl-2"
        style={{ width: ITEM_WIDTH }}
      >
        <View style={{ opacity: isActive ? 0 : 1 }}>
          <AddTripItemMenu order={addBeforeOrder}>
            <TouchableOpacity className="rounded-full bg-primary p-1">
              <Icon icon={Plus} size={16} color="white" />
            </TouchableOpacity>
          </AddTripItemMenu>
        </View>

        <View className="relative h-full w-full flex-1 rounded bg-background dark:bg-background-dark">
          {spot ? (
            <Link href={`/${tab}/spot/${spot.id}`} push asChild>
              <View className="h-full w-full">
                {spot.images?.[0] ? (
                  <OptimizedImage
                    width={300}
                    placeholder={spot.images[0].blurHash}
                    height={150}
                    className="w-full flex-1 rounded-t bg-gray-50 object-cover dark:bg-gray-800"
                    source={{ uri: createAssetUrl(spot.images[0].path) }}
                  />
                ) : (
                  <View className="flex h-full w-full flex-1 items-center justify-center rounded bg-gray-50 dark:bg-gray-800">
                    <View className="rounded-full p-4">
                      <SpotIcon type={spot.type} size={30} />
                    </View>
                  </View>
                )}
                {spot.images?.[0] && (
                  <View className="sq-8 absolute top-1 left-1 flex items-center justify-center rounded-full bg-background dark:bg-background-dark">
                    <SpotIcon type={spot.type} size={16} />
                  </View>
                )}

                <Text numberOfLines={1} className="p-1 font-500 text-xs">
                  {spot.name}
                </Text>
              </View>
            </Link>
          ) : stop ? (
            stop.image ? (
              <View className="relative h-full w-full overflow-hidden rounded-sm">
                <Image source={{ uri: stop.image }} className="h-full w-full" />
                <View className="absolute top-0 right-0 bottom-0 left-0 items-center justify-center bg-black/40 p-2">
                  <Text className="text-center text-white">{stop.name}</Text>
                </View>
              </View>
            ) : (
              <View className="flex h-full w-full flex-row items-center justify-center space-x-2 rounded-sm border border-gray-200 p-2 dark:border-gray-700">
                <Text className="text-center">{stop.name}</Text>
              </View>
            )
          ) : null}
          {isFocused && <View className="absolute top-0 right-0 bottom-0 left-0 h-0.5 rounded-t-sm bg-primary" />}

          {item.date && (
            <View className="absolute top-1 right-1 flex items-center justify-center rounded-full bg-blue-500 px-2 py-1">
              <Text className="font-600 text-white text-xxs">{dayjs(item.date).format("DD MMM YY")}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  )
})

const HEADER_FOOTER_WIDTH = 80
function ListHeader({ trip }: { trip: RouterOutputs["trip"]["detail"]["trip"] }) {
  return (
    <View className="flex h-full items-center justify-center">
      <View
        style={{ width: HEADER_FOOTER_WIDTH, height: HEADER_FOOTER_WIDTH }}
        className="flex items-center justify-center space-y-2 rounded-full shadow bg-background p-2 dark:bg-background-dark"
      >
        <Icon icon={Home} size={16} />
        <Text className="text-xxs">{dayjs(trip.startDate).format("D MMM YY")}</Text>
      </View>
    </View>
  )
}

function ListFooter({ trip }: { trip: RouterOutputs["trip"]["detail"]["trip"] }) {
  const hasNoItems = trip.items.length === 0
  return (
    <View className="flex h-full flex-row items-center space-x-2 pl-2">
      <AddTripItemMenu>
        <TouchableOpacity
          className={join("flex flex-row items-center space-x-2 rounded-full bg-primary p-1", hasNoItems && "p-5")}
        >
          <Icon icon={Plus} size={16} color="white" />
          {hasNoItems && <Text className="font-600 text-sm text-white">Add your first stop</Text>}
        </TouchableOpacity>
      </AddTripItemMenu>
      <View className="flex h-full items-center justify-center">
        <View
          style={{ width: HEADER_FOOTER_WIDTH, height: HEADER_FOOTER_WIDTH }}
          className="flex items-center justify-center space-y-2 rounded-full shadow bg-background p-2 dark:bg-background-dark"
        >
          <Icon icon={Flag} size={16} />
          <Text className="text-xxs">{dayjs(trip.endDate).format("D MMM YY")}</Text>
        </View>
      </View>
    </View>
  )
}

function AddTripItemMenu({ order, children }: { order?: number; children: React.ReactElement }) {
  const { id } = useLocalSearchParams<{ id: string }>()
  const coords = useMapCoords((s) => s.coords)
  const router = useRouter()
  const tab = useTabSegment()
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item key="add-stop" onSelect={() => router.push(`/${tab}/trip/${id}/add-location?order=${order || 0}`)}>
          <DropdownMenu.ItemIcon ios={{ name: "mappin.and.ellipse", pointSize: 10, scale: "large" }} />
          <DropdownMenu.ItemTitle>Add location</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          key="new-spot"
          onSelect={() => {
            const searchParams = new URLSearchParams({
              initialLng: coords[0].toString(),
              initialLat: coords[1].toString(),
              tripId: id,
              order: order?.toString() || "",
            })
            router.push(`/new/?${searchParams}`)
          }}
        >
          <DropdownMenu.ItemIcon ios={{ name: "plus.circle", pointSize: 10, scale: "large" }} />
          <DropdownMenu.ItemTitle>Add a new spot</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
        <DropdownMenu.Item key="find-spot" onSelect={() => router.push(`/${tab}/trip/${id}/find-spot?order=${order}`)}>
          <DropdownMenu.ItemIcon ios={{ name: "magnifyingglass", pointSize: 10, scale: "large" }} />
          <DropdownMenu.ItemTitle>Find an existing spot</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>

        <DropdownMenu.Arrow />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
