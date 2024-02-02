import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { Link, useLocalSearchParams, useRouter } from "expo-router"

import { Map } from "~/components/Map"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { RouterOutputs, api } from "~/lib/api"

import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { Camera, UserLocation, type MapView as MapType, StyleURL } from "@rnmapbox/maps"
import { INITIAL_LATITUDE, INITIAL_LONGITUDE, createImageUrl } from "@ramble/shared"
import { ChevronLeft, PlusCircle } from "lucide-react-native"
import { Icon } from "~/components/Icon"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { SpotIcon } from "~/components/SpotIcon"
import { BrandHeading } from "~/components/ui/BrandHeading"
import { SafeAreaView } from "~/components/SafeAreaView"
import Animated, {
  SharedValue,
  // runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { Gesture, GestureDetector } from "react-native-gesture-handler"

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: trip, isLoading } = api.trip.detail.useQuery({ id })
  const router = useRouter()

  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)

  const tab = useTabSegment()
  return (
    <SafeAreaView>
      <View className="flex-1 pt-2">
        <View className="flex flex-row items-center justify-between px-4 pb-2">
          <View className="flex h-[40px] flex-row items-center space-x-0.5">
            <TouchableOpacity onPress={router.back} className="sq-8 flex items-center justify-center pt-0.5">
              <Icon icon={ChevronLeft} color="primary" />
            </TouchableOpacity>

            <BrandHeading className="text-xl">{(trip?.name || "").toLowerCase()}</BrandHeading>
          </View>

          <TouchableOpacity
            className="sq-8 flex items-center justify-center"
            onPress={() => router.push(`/${tab}/list/${id}/edit`)}
          >
            <Text className="underline">Edit</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="flex items-center justify-center p-4">
            <Spinner />
          </View>
        ) : !trip ? (
          <View className="flex items-center justify-center p-4">
            <Text>Trip not found</Text>
          </View>
        ) : (
          <>
            <Map
              // onMapIdle={onMapMove}
              ref={mapRef}
              styleURL={StyleURL.SatelliteStreet}
              compassPosition={{ top: 8, right: 8 }}
            >
              <UserLocation />
              <Camera
                ref={camera}
                allowUpdates
                defaultSettings={{
                  centerCoordinate: [INITIAL_LONGITUDE, INITIAL_LATITUDE],
                  zoomLevel: 14,
                  pitch: 0,
                  heading: 0,
                }}
              />
            </Map>
            <View>
              <ScrollView
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12, width: trip.items.length * ITEM_WIDTH }}
                className="h-[160px] py-3"
                horizontal
              >
                {/* <ListHeader /> */}
                <TripItemsList items={trip.items} />
                {/* <ListFooter /> */}
              </ScrollView>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

type Item = RouterOutputs["trip"]["detail"]["items"][number]
type Positions = { [key: string]: Item }
function TripItemsList({ items }: { items: Item[] }) {
  const positions = useSharedValue(
    items.reduce<Positions>((acc, item) => {
      acc[item.id] = item
      return acc
    }, {}),
  )

  React.useEffect(() => {
    positions.value = items.reduce<Positions>((acc, item) => {
      acc[item.id] = item
      return acc
    }, {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  const isDragging = useSharedValue(false)

  return (
    <>
      {items.map((item, index) => (
        <TripItem
          key={item.id}
          positions={positions}
          item={item}
          isDragging={isDragging}
          // each item renders a add button before it, instead of having to reorder every single item in the list when adding a item inbetween the first two, we can just get the number directly inbetween the current order and the previous one, so 1 -> 1.5 -> 2. Means order can be any decimal, will get a bit risky if theres a lot of items as the float might run out of precision maybe?
          addOrder={items[index - 1] ? (item.order + items[index - 1]!.order) / 2 : 0}
        />
      ))}
    </>
  )
}

const ITEM_WIDTH = 180
// const SMALL_ITEM_WIDTH = ITEM_WIDTH * 0.5

function TripItem({
  item,
  positions,
  addOrder,
  isDragging,
}: {
  isDragging: SharedValue<boolean>
  positions: SharedValue<Positions>
  addOrder: number
  item: RouterOutputs["trip"]["detail"]["items"][number]
}) {
  // const width = useSharedValue(ITEM_WIDTH)
  const { id } = useLocalSearchParams<{ id: string }>()
  const spot = item.spot
  const stop = item.stop
  const utils = api.useUtils()
  const tab = useTabSegment()

  const translateX = useSharedValue(
    (positions.value[item.id] ? positions.value[item.id]!.order : Object.keys(positions.value).length) * ITEM_WIDTH,
  )

  const offsetX = useSharedValue(translateX.value)
  const scale = useSharedValue(1)
  const isActive = useSharedValue(false)

  useAnimatedReaction(
    () => positions.value[item.id]!,
    (newPosition) => {
      // const x = newPosition.order * (isDragging.value ? SMALL_ITEM_WIDTH : ITEM_WIDTH)
      const x = newPosition.order * ITEM_WIDTH
      translateX.value = withTiming(x)
    },
  )

  // useAnimatedReaction(
  //   () => isDragging.value,
  //   (newIsDragging) => {
  //     width.value = withTiming(newIsDragging ? SMALL_ITEM_WIDTH : ITEM_WIDTH)
  //     const x = positions.value[item.id]!.order * (newIsDragging ? SMALL_ITEM_WIDTH : ITEM_WIDTH)
  //     translateX.value = withTiming(x)
  //   },
  // )

  const styles = useAnimatedStyle(() => {
    return {
      position: "absolute",
      height: "100%",
      // width: "100%",
      zIndex: isActive.value ? 10 : 0,
      transform: [{ translateX: translateX.value }, { scale: scale.value }],
    }
  })

  const pan = Gesture.Pan()
    .activateAfterLongPress(200)
    .onStart(() => {
      offsetX.value = translateX.value
      scale.value = withTiming(1.05)
      isActive.value = true
      isDragging.value = true
      // runOnJS(setIsDragActive)(true)
      // runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
    })
    .onUpdate((event) => {
      translateX.value = Math.max(offsetX.value + event.translationX, 0)

      const currentItem = positions.value[item.id]!
      const newPositions = { ...positions.value }
      const newOrder = Math.floor((translateX.value + ITEM_WIDTH * 0.5) / ITEM_WIDTH)

      const itemsToSwap = Object.values(newPositions).find((t) => t.order === newOrder)
      if (!itemsToSwap || itemsToSwap.id === currentItem.id) return
      newPositions[currentItem.id]! = { ...currentItem, order: newOrder }
      newPositions[itemsToSwap.id]! = { ...itemsToSwap, order: currentItem.order }
      positions.value = newPositions
    })
    .onEnd(() => {
      const newOrder = positions.value[item.id]!.order
      translateX.value = withTiming(newOrder * ITEM_WIDTH)

      // runOnJS(handleUpdateOrder)()
    })
    .onFinalize(() => {
      scale.value = withTiming(1, undefined, () => {
        isActive.value = false
      })
      isDragging.value = false
      // runOnJS(setIsDragActive)(false)
    })

  // const gesture = Gesture.Race(Gesture.Simultaneous(pan, longPress), tap)
  const gesture = pan

  const addStyles = useAnimatedStyle(() => {
    return {
      opacity: isDragging.value ? 0 : 1,
    }
  })
  return (
    <Animated.View style={styles}>
      <GestureDetector gesture={gesture}>
        <View className="flex w-full flex-row items-center" style={{ width: ITEM_WIDTH }}>
          <Animated.View className="flex" style={addStyles}>
            <Link push href={`/(home)/(trips)/trips/${id}/add?order=${addOrder}`} asChild>
              <TouchableOpacity className=" p-3">
                <Icon icon={PlusCircle} size={16} />
              </TouchableOpacity>
            </Link>
          </Animated.View>

          <View className="h-full w-full flex-1">
            {spot ? (
              <Link href={`/${tab}/spot/${spot.id}`} push asChild>
                <TouchableOpacity
                  onPressIn={() => {
                    void utils.spot.detail.prefetch({ id: spot.id })
                  }}
                  className="h-full w-full"
                  activeOpacity={0.8}
                >
                  {spot.images && spot.images[0] ? (
                    <OptimizedImage
                      width={300}
                      placeholder={spot.images[0].blurHash}
                      height={150}
                      className="w-full flex-1 rounded bg-gray-50 object-cover dark:bg-gray-800"
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
                  <View className="flex flex-row items-center py-1">
                    <Text numberOfLines={1} className="font-500 text-xs">
                      {spot.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Link>
            ) : stop ? (
              <View className="flex h-full w-full flex-row items-center justify-center space-x-2 rounded-sm border border-gray-200 p-2">
                <Text>{stop.name}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </GestureDetector>
    </Animated.View>
  )
}

// const HEADER_WIDTH = 100
// function ListHeader() {
//   return (
//     <View style={{ width: 100 }} className="flex h-full items-center justify-center space-y-1 rounded-sm border border-gray-100">
//       <Icon icon={Home} />
//       <Text className="text-center text-xs">01 Jan 2025</Text>
//     </View>
//   )
// }

// function ListFooter() {
//   const { id } = useLocalSearchParams<{ id: string }>()
//   return (
//     <View className="flex flex-row items-center">
//       <Link push href={`/(home)/(trips)/trips/${id}/add`} asChild>
//         <TouchableOpacity className="p-3">
//           <Icon icon={PlusCircle} size={16} />
//         </TouchableOpacity>
//       </Link>
//       <View className="flex h-full w-[100px] items-center justify-center space-y-1 rounded-sm border border-gray-100">
//         <Icon icon={Flag} />
//         <Text className="text-center text-xs">01 Mar 2025</Text>
//       </View>
//     </View>
//   )
// }
