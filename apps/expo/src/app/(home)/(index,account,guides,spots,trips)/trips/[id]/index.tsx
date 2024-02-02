import { Link, useLocalSearchParams, useRouter } from "expo-router"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist"

import { Map } from "~/components/Map"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { RouterOutputs, api } from "~/lib/api"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { createImageUrl } from "@ramble/shared"
import { Camera, StyleURL, UserLocation, type MapView as MapType, MarkerView, LineLayer, ShapeSource } from "@rnmapbox/maps"
import { ChevronLeft, Flag, Home, PlusCircle } from "lucide-react-native"
import { Icon } from "~/components/Icon"
import { SafeAreaView } from "~/components/SafeAreaView"
import { SpotIcon } from "~/components/SpotIcon"
import { BrandHeading } from "~/components/ui/BrandHeading"
import { OptimizedImage } from "~/components/ui/OptimisedImage"

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data, isLoading } = api.trip.detail.useQuery({ id })
  const trip = data?.trip
  const bounds = data?.bounds
  const center = data?.center
  const router = useRouter()

  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)

  const spotMarkers = React.useMemo(
    () =>
      trip?.items.map((item) => (
        <MarkerView
          allowOverlap
          key={item.id}
          coordinate={item.spot ? [item.spot.longitude, item.spot.latitude] : [item.stop!.longitude, item.stop!.latitude]}
        >
          <TouchableOpacity>{item.spot ? <SpotItemMarker /> : <StopItemMarker />}</TouchableOpacity>
        </MarkerView>
      )),

    [trip?.items],
  )

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
            onPress={() => router.push(`/${tab}/trips/${id}/edit`)}
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
              {data.line && (
                <ShapeSource id="directions" shape={data.line.geometry}>
                  <LineLayer id="line" style={{ lineDasharray: [0.5, 2], lineColor: "white", lineCap: "round", lineWidth: 2 }} />
                </ShapeSource>
              )}
              {spotMarkers}
              <UserLocation />
              <Camera
                ref={camera}
                allowUpdates
                defaultSettings={
                  center
                    ? { pitch: 0, heading: 0, centerCoordinate: center, zoomLevel: 5 }
                    : bounds
                      ? {
                          pitch: 0,
                          heading: 0,
                          bounds: {
                            paddingBottom: 50,
                            paddingTop: 50,
                            paddingLeft: 50,
                            paddingRight: 50,
                            sw: [bounds[0]!, bounds[1]!],
                            ne: [bounds[2]!, bounds[3]!],
                          },
                        }
                      : undefined
                }
              />
            </Map>
            <View>
              <TripList
                items={trip.items}
                onScrollEnd={(index) => {
                  const item = trip.items[index]
                  if (!item) return
                  const coords = item.spot
                    ? [item.spot.longitude, item.spot.latitude]
                    : [item.stop!.longitude, item.stop!.latitude]

                  camera.current?.setCamera({
                    animationMode: "linearTo",
                    animationDuration: 300,
                    centerCoordinate: coords,
                  })
                }}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

type Item = RouterOutputs["trip"]["detail"]["trip"]["items"][number]

function TripList({ items, onScrollEnd }: { items: Item[]; onScrollEnd: (index: number) => void }) {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [tripItems, setTripItems] = React.useState(items)
  const utils = api.useUtils()
  const { mutate } = api.trip.updateOrder.useMutation({
    onSuccess: () => {
      utils.trip.detail.refetch({ id })
    },
  })
  const [activeItemIndex, setActiveItemIndex] = React.useState<number | null>(null)
  const activeIndexRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    setTripItems(items)
  }, [items])

  return (
    <DraggableFlatList
      horizontal
      onDragEnd={(dragData) => {
        setTripItems(dragData.data)
        mutate({ id, items: dragData.data.map((i) => i.id) })
      }}
      scrollEventThrottle={1000}
      onScrollOffsetChange={(x) => {
        if (x < 0) return
        const index = Math.floor(x / ITEM_WIDTH)
        if (index !== activeItemIndex && index !== activeIndexRef.current) {
          onScrollEnd(index)
          setActiveItemIndex(index)
          activeIndexRef.current = index
        }
      }}
      autoscrollThreshold={20}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      className="h-[160px] py-3"
      contentContainerStyle={{ paddingRight: 50, paddingLeft: 12 }}
      data={tripItems}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      renderItem={(props) => <TripItem {...props} isFocused={props.getIndex() === activeItemIndex} />}
    />
  )
}

const ITEM_WIDTH = 180

function TripItem({
  item,
  isActive,
  isFocused,
  drag,
}: {
  isFocused: boolean
} & RenderItemParams<Item>) {
  const { id } = useLocalSearchParams<{ id: string }>()
  const spot = item.spot
  const stop = item.stop
  const utils = api.useUtils()
  const tab = useTabSegment()
  const router = useRouter()

  return (
    <ScaleDecorator>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (spot) router.push(`/${tab}/spot/${spot.id}`)
        }}
        onPressIn={() => {
          if (spot) void utils.spot.detail.prefetch({ id: spot.id })
        }}
        onLongPress={drag}
        className="flex w-full flex-row items-center"
        style={{ width: ITEM_WIDTH }}
      >
        <View style={{ opacity: isActive ? 0 : 1 }}>
          <Link push href={`/(home)/(trips)/trips/${id}/add?order=${0}`} asChild>
            <TouchableOpacity className=" p-3">
              <Icon icon={PlusCircle} size={16} />
            </TouchableOpacity>
          </Link>
        </View>

        <View className="bg-background dark:bg-background-dark relative h-full w-full flex-1">
          {spot ? (
            <Link href={`/${tab}/spot/${spot.id}`} push asChild>
              <View className="h-full w-full">
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
              </View>
            </Link>
          ) : stop ? (
            <View className="flex h-full w-full flex-row items-center justify-center space-x-2 rounded-sm border border-gray-200 p-2">
              <Text>{stop.name}</Text>
            </View>
          ) : null}
          {isFocused && <View className="bg-primary absolute bottom-0 left-0 right-0 top-0 h-1 rounded-t-sm" />}
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  )
}

function SpotItemMarker() {
  return (
    <View className="bg-primary-500 sq-7 flex items-center justify-center rounded-full">
      <Text className="text-xxs">Spot</Text>
    </View>
  )
}

function StopItemMarker() {
  return (
    <View className="sq-7 flex items-center justify-center rounded-full bg-green-500">
      <Text className="text-xxs">Stop</Text>
    </View>
  )
}

const HEADER_FOOTER_WIDTH = 100
function ListHeader() {
  return (
    <View
      style={{ width: HEADER_FOOTER_WIDTH }}
      className="flex h-full items-center justify-center space-y-1 rounded-sm border border-gray-100"
    >
      <Icon icon={Home} />
      <Text className="text-center text-xs">01 Jan 2025</Text>
    </View>
  )
}

function ListFooter() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <View style={{ width: HEADER_FOOTER_WIDTH }} className="flex h-full flex-row items-center">
      <Link push href={`/(home)/(trips)/trips/${id}/add`} asChild>
        <TouchableOpacity className="p-3">
          <Icon icon={PlusCircle} size={16} />
        </TouchableOpacity>
      </Link>
      <View className="flex h-full w-[100px] items-center justify-center space-y-1 rounded-sm border border-gray-100">
        <Icon icon={Flag} />
        <Text className="text-center text-xs">01 Mar 2025</Text>
      </View>
    </View>
  )
}
