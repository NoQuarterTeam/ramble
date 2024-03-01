import { useActionSheet } from "@expo/react-native-action-sheet"
import { Camera, LineLayer, LocationPuck, type MapView as MapType, MarkerView, ShapeSource, StyleURL } from "@rnmapbox/maps"
import dayjs from "dayjs"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import * as Location from "expo-location"
import { Link, useLocalSearchParams, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ChevronLeft, Edit2, Flag, Home, MapPin, PlusCircle, Users } from "lucide-react-native"
import * as React from "react"
import { ActivityIndicator, TouchableOpacity, View } from "react-native"
import DraggableFlatList, { type RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { createImageUrl, join } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { LoginPlaceholder } from "~/components/LoginPlaceholder"
import { MapView } from "~/components/Map"
import { SpotIcon } from "~/components/SpotIcon"
import { SpotMarker } from "~/components/SpotMarker"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { ScreenView } from "~/components/ui/ScreenView"
import { Text } from "~/components/ui/Text"
import { type RouterOutputs, api } from "~/lib/api"
import { useMapCoords } from "~/lib/hooks/useMapCoords"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

export default function TripDetailScreen() {
  const { me } = useMe()
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data, isLoading } = api.trip.detail.useQuery({ id })
  const trip = data?.trip
  const bounds = data?.bounds
  const center = data?.center

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

  const utils = api.useUtils()
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trip?.items, tab],
  )

  const setCoords = useMapCoords((s) => s.setCoords)

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

      <MapView
        ref={mapRef}
        styleURL={StyleURL.SatelliteStreet}
        compassPosition={{ top: 54, right: 12 }}
        onMapIdle={({ properties }) => {
          setCoords(properties.center)
        }}
      >
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
                    zoomLevel: 5,
                    centerCoordinate: userLocation ? [userLocation.longitude, userLocation.latitude] : undefined,
                  }
          }
        />
      </MapView>

      <View
        style={{ top: insets.top + 8 }}
        pointerEvents="box-none"
        className="absolute left-0 right-0 flex flex-row items-center justify-between px-4"
      >
        <View className="flex flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={router.back}
            activeOpacity={0.5}
            className="sq-8 bg-background dark:bg-background-dark just flex  h-10 w-10 flex-row items-center justify-center rounded-full"
          >
            <Icon icon={ChevronLeft} />
          </TouchableOpacity>

          <View className="bg-background dark:bg-background-dark flex h-10 flex-row items-center rounded-full">
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

        {trip && (
          <View className="flex flex-row items-center space-x-1">
            {trip.creatorId === me?.id && (
              <Link push href={`/${tab}/trips/${id}/users`} asChild>
                <TouchableOpacity
                  className="sq-10 bg-background dark:bg-background-dark flex items-center justify-center rounded-full"
                  activeOpacity={0.8}
                >
                  <Icon icon={Users} size={16} />
                </TouchableOpacity>
              </Link>
            )}
            <Link push href={`/${tab}/trips/${id}/edit`} asChild>
              <TouchableOpacity
                className="sq-10 bg-background dark:bg-background-dark flex items-center justify-center rounded-full"
                activeOpacity={0.8}
              >
                <Icon icon={Edit2} size={16} />
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </View>

      <View className="absolute bottom-0 left-0 right-0">
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
      utils.trip.detail.refetch({ id })
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
      onDragEnd={(dragData) => {
        setTripItems(dragData.data)
        mutate({ id, items: dragData.data.map((i) => i.id) })
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
      ListFooterComponent={<ListFooter trip={trip} hasNoItems={trip.items.length === 0} />}
      className="py-3"
      style={{ height: LIST_HEIGHT }}
      contentContainerStyle={{ paddingRight: 60, paddingLeft: 12 }}
      data={tripItems}
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

  const { mutate } = api.trip.removeItem.useMutation({
    onSuccess: () => {
      utils.trip.detail.refetch({ id })
    },
  })
  const handleOpenMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (item.spot) {
      const options = ["View", "Remove", "Cancel"]
      const viewIndex = 0
      const destructiveButtonIndex = 1
      const cancelButtonIndex = 2
      showActionSheetWithOptions({ options, cancelButtonIndex, destructiveButtonIndex }, (selectedIndex) => {
        switch (selectedIndex) {
          case viewIndex:
            // Edit
            router.push(`/${tab}/spot/${item.spot?.id}`)
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
      const options = ["Remove", "Cancel"]
      const destructiveButtonIndex = 0
      const cancelButtonIndex = 1
      showActionSheetWithOptions({ options, cancelButtonIndex, destructiveButtonIndex }, (selectedIndex) => {
        switch (selectedIndex) {
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
        className="flex w-full flex-row items-center space-x-2 pl-2"
        style={{ width: ITEM_WIDTH }}
      >
        <View style={{ opacity: isActive ? 0 : 1 }}>
          <Link push href={`/(home)/(trips)/trips/${id}/add?order=${addBeforeOrder}`} asChild>
            <TouchableOpacity className="bg-background dark:bg-background-dark rounded-full p-2">
              <Icon icon={PlusCircle} size={16} />
            </TouchableOpacity>
          </Link>
        </View>

        <View className="bg-background dark:bg-background-dark relative h-full w-full flex-1 rounded">
          {spot ? (
            <Link href={`/${tab}/spot/${spot.id}`} push asChild>
              <View className="h-full w-full">
                {spot.images?.[0] ? (
                  <OptimizedImage
                    width={300}
                    placeholder={spot.images[0].blurHash}
                    height={150}
                    className="w-full flex-1 rounded-t bg-gray-50 object-cover dark:bg-gray-800"
                    source={{ uri: createImageUrl(spot.images[0].path) }}
                  />
                ) : (
                  <View className="flex h-full w-full flex-1 items-center justify-center rounded bg-gray-50 dark:bg-gray-800">
                    <View className="rounded-full p-4">
                      <SpotIcon type={spot.type} size={30} />
                    </View>
                  </View>
                )}
                {spot.images?.[0] && (
                  <View className="sq-8 bg-background dark:bg-background-dark absolute left-1 top-1 flex items-center justify-center rounded-full">
                    <SpotIcon type={spot.type} size={16} />
                  </View>
                )}

                <Text numberOfLines={1} className="font-500 p-1 text-xs">
                  {spot.name}
                </Text>
              </View>
            </Link>
          ) : stop ? (
            stop.image ? (
              <View className="relative h-full w-full overflow-hidden rounded-sm">
                <Image source={{ uri: stop.image }} className="h-full w-full" />
                <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center bg-black/40 p-2">
                  <Text className="text-center text-white">{stop.name}</Text>
                </View>
              </View>
            ) : (
              <View className="flex h-full w-full flex-row items-center justify-center space-x-2 rounded-sm border border-gray-200 p-2 dark:border-gray-700">
                <Text className="text-center">{stop.name}</Text>
              </View>
            )
          ) : null}
          {isFocused && <View className="bg-primary absolute bottom-0 left-0 right-0 top-0 h-0.5 rounded-t-sm" />}
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
        className="bg-background dark:bg-background-dark flex items-center justify-center space-y-2 rounded-full border-2 border-gray-700 p-2"
      >
        <Icon icon={Home} size={16} />
        <Text className="text-xxs">{dayjs(trip.startDate).format("D MMM YY")}</Text>
      </View>
    </View>
  )
}

function ListFooter({ trip, hasNoItems }: { hasNoItems: boolean; trip: RouterOutputs["trip"]["detail"]["trip"] }) {
  const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <View className="flex h-full flex-row items-center space-x-2 pl-2">
      <Link push href={`/(home)/(trips)/trips/${id}/add`} asChild>
        <TouchableOpacity
          className={join(
            "bg-background dark:bg-background-dark flex flex-row items-center space-x-2 rounded-full p-2",
            hasNoItems && "bg-primary p-5",
          )}
        >
          <Icon icon={PlusCircle} size={16} color={hasNoItems ? "white" : undefined} />
          {hasNoItems && <Text className="font-600 text-sm text-white">Add you first stop</Text>}
        </TouchableOpacity>
      </Link>
      <View className="flex h-full items-center justify-center">
        <View
          style={{ width: HEADER_FOOTER_WIDTH, height: HEADER_FOOTER_WIDTH }}
          className="bg-background dark:bg-background-dark flex items-center justify-center space-y-2 rounded-full border-2 border-gray-700 p-2"
        >
          <Icon icon={Flag} size={16} />
          <Text className="text-xxs">{dayjs(trip.endDate).format("D MMM YY")}</Text>
        </View>
      </View>
    </View>
  )
}
