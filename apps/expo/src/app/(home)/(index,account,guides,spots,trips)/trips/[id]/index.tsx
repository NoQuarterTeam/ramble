import { Link, useLocalSearchParams, useRouter } from "expo-router"
import * as React from "react"
import { Image } from "expo-image"
import * as Haptics from "expo-haptics"
import { TouchableOpacity, View } from "react-native"
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist"
import * as Location from "expo-location"
import { Map } from "~/components/Map"
import { Text } from "~/components/ui/Text"
import { RouterOutputs, api } from "~/lib/api"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { INITIAL_LATITUDE, INITIAL_LONGITUDE, createImageUrl } from "@ramble/shared"
import { Camera, LineLayer, MarkerView, ShapeSource, StyleURL, UserLocation, type MapView as MapType } from "@rnmapbox/maps"
import { StatusBar } from "expo-status-bar"
import { ChevronLeft, Edit2, Flag, Home, MapPin, PlusCircle } from "lucide-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Icon } from "~/components/Icon"
import { SpotIcon } from "~/components/SpotIcon"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { SpotMarker } from "~/components/SpotMarker"
import { useActionSheet } from "@expo/react-native-action-sheet"

export default function TripDetailScreen() {
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
  const itemMarkers = React.useMemo(
    () =>
      trip?.items.map(
        (item) =>
          (item.spot || item.stop) && (
            <MarkerView
              allowOverlap
              key={item.id}
              coordinate={item.spot ? [item.spot.longitude, item.spot.latitude] : [item.stop!.longitude, item.stop!.latitude]}
            >
              <TouchableOpacity
                activeOpacity={item.spot ? 0.8 : 1}
                onPressIn={item.spot ? () => utils.spot.detail.prefetch({ id: item.spot!.id }) : undefined}
                onPress={item.spot ? () => router.push(`/${tab}/spot/${item.spot!.id}`) : undefined}
              >
                {item.spot ? <SpotMarker spot={item.spot} /> : <Icon icon={MapPin} size={24} fill="white" color="black" />}
              </TouchableOpacity>
            </MarkerView>
          ),
      ),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trip?.items, tab],
  )

  const insets = useSafeAreaInsets()
  return (
    <View className="flex-1">
      <StatusBar style="light" />
      {!isLoading && (
        <Map ref={mapRef} styleURL={StyleURL.SatelliteStreet} compassPosition={{ top: 54, right: 12 }}>
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
          <UserLocation />

          <Camera
            ref={camera}
            allowUpdates
            pitch={0}
            heading={0}
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
                      bounds: { sw: [bounds[0]!, bounds[1]!], ne: [bounds[2]!, bounds[3]!] },
                    }
                  : {
                      zoomLevel: 5,
                      centerCoordinate: userLocation
                        ? [userLocation.longitude, userLocation.latitude]
                        : [INITIAL_LONGITUDE, INITIAL_LATITUDE],
                    }
            }
          />
        </Map>
      )}
      <View style={{ top: insets.top + 8 }} className="absolute left-0 right-0 flex w-full flex-row justify-between px-4">
        <TouchableOpacity
          onPress={router.back}
          activeOpacity={0.8}
          className="sq-8 bg-background dark:bg-background-dark flex items-center justify-center rounded-full"
        >
          <Icon icon={ChevronLeft} />
        </TouchableOpacity>

        <Link push href={`/${tab}/trips/${id}/edit`} asChild>
          <TouchableOpacity
            className="sq-8 bg-background dark:bg-background-dark flex items-center justify-center rounded-full"
            activeOpacity={0.8}
          >
            <Icon icon={Edit2} size={16} />
          </TouchableOpacity>
        </Link>
      </View>
      <View className="absolute bottom-0 left-0 right-0">
        {trip && (
          <TripList
            trip={trip}
            onScrollEnd={(index) => {
              const item = trip.items[index]
              if (!item) return
              const coords = item.spot ? [item.spot.longitude, item.spot.latitude] : [item.stop!.longitude, item.stop!.latitude]
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
      ListFooterComponent={ListFooter}
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
            router.push(`/${tab}/spot/${item.spot!.id}`)
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
                {spot.images && spot.images[0] ? (
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
                  <Text className="text-center">{stop.name}</Text>
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

const HEADER_FOOTER_WIDTH = 100
function ListHeader({ trip }: { trip: RouterOutputs["trip"]["detail"]["trip"] }) {
  return (
    <View className="flex h-full items-center justify-center">
      <View
        style={{ width: HEADER_FOOTER_WIDTH, height: HEADER_FOOTER_WIDTH }}
        className="bg-background dark:bg-background-dark flex items-center justify-center space-y-1 rounded-full border-2 border-gray-700 p-2"
      >
        <Icon icon={Home} size={16} />
        <Text className="text-sm" numberOfLines={2}>
          {trip.name}
        </Text>
        {/* <Text className="text-xs">01 Jan 2025</Text> */}
      </View>
    </View>
  )
}

function ListFooter() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <View style={{ width: HEADER_FOOTER_WIDTH }} className="flex h-full flex-row items-center space-x-2 pl-2">
      <Link push href={`/(home)/(trips)/trips/${id}/add`} asChild>
        <TouchableOpacity className="bg-background dark:bg-background-dark rounded-full p-2">
          <Icon icon={PlusCircle} size={16} />
        </TouchableOpacity>
      </Link>
      <View className="flex h-full items-center justify-center">
        <View
          style={{ width: HEADER_FOOTER_WIDTH, height: HEADER_FOOTER_WIDTH }}
          className="bg-background dark:bg-background-dark flex items-center justify-center space-y-2 rounded-full border-2 border-gray-700 p-2"
        >
          <Icon icon={Flag} />
          {/* <Text className="text-center text-xs">01 Mar 2025</Text> */}
        </View>
      </View>
    </View>
  )
}
