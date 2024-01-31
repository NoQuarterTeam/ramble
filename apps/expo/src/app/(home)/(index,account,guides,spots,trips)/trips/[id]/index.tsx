import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useLocalSearchParams, useRouter } from "expo-router"

import { Button } from "~/components/ui/Button"
import { Map } from "~/components/Map"
import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"
import { TripSpotItem } from "~/components/TripSpotItem"
import { Camera, UserLocation, type MapView as MapType, StyleURL } from "@rnmapbox/maps"
import { INITIAL_LATITUDE, INITIAL_LONGITUDE } from "@ramble/shared"
import { Flag, Home, Plus } from "lucide-react-native"
import { Icon } from "~/components/Icon"

export default function TripDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const { me } = useMe()
  const { data: trip, isLoading } = api.trip.detail.useQuery({ id: params.id })
  const { data: tripItems, isLoading: tripItemsLoading } = api.trip.tripItems.useQuery({ id: params.id })
  const router = useRouter()

  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)

  const tab = useTabSegment()
  return (
    <ScreenView
      title={trip?.name || "my trip"}
      rightElement={
        trip &&
        me?.id === trip.creatorId && (
          <TouchableOpacity
            className="sq-8 flex items-center justify-center"
            onPress={() => router.push(`/${tab}/list/${trip.id}/edit`)}
          >
            <Text className="underline">Edit</Text>
          </TouchableOpacity>
        )
      }
    >
      {isLoading || tripItemsLoading ? (
        <View className="flex items-center justify-center p-4">
          <Spinner />
        </View>
      ) : !trip ? (
        <View className="flex items-center justify-center p-4">
          <Text>Trip not found</Text>
        </View>
      ) : (
        <>
          <View className="h-[70%]">
            <Map
              className="rounded-xs overflow-hidden"
              // onMapIdle={onMapMove}
              ref={mapRef}
              styleURL={StyleURL.SatelliteStreet}
              compassPosition={{ top: 54, right: 8 }}
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
          </View>

          <View className="h-[22%] w-full">
            <FlashList
              horizontal
              showsHorizontalScrollIndicator={false}
              estimatedItemSize={100}
              contentContainerStyle={{ paddingVertical: 8 }}
              ListEmptyComponent={
                <View>
                  <Text className="w-full py-4 text-center text-xl">No spots yet</Text>
                  <Button variant="outline" onPress={() => router.navigate("/")} className="w-full">
                    Add a spot to your trip!
                  </Button>
                </View>
              }
              data={tripItems}
              ListHeaderComponent={() => <ListHeader />}
              renderItem={({ item }) => item.spot && <TripSpotItem spot={item.spot} />}
              ItemSeparatorComponent={() => <ItemSeparator />}
              ListFooterComponent={() => <ListFooter tripId={trip.id} />}
            />
          </View>
        </>
      )}
    </ScreenView>
  )
}

function ListHeader() {
  return (
    <View className="flex h-full flex-row space-x-2">
      <View className="flex h-full w-[45px] items-center justify-center space-y-1">
        <Icon icon={Home} />
        <Text className="text-center text-xs">01 Jan 2025</Text>
      </View>
      <ItemSeparator />
    </View>
  )
}

function ItemSeparator() {
  return (
    <View className="flex w-[40px] justify-center px-1">
      <View
        className="w-full border-t-2 border-gray-300" // Annoyingly border top width + border style doesn't work in iOS
      />
    </View>
  )
}

function ListFooter({ tripId }: { tripId: string }) {
  const router = useRouter()
  return (
    <View className="flex h-full flex-row">
      <ItemSeparator />
      <TouchableOpacity
        onPress={() => router.push(`/(home)/(trips)/trips/${tripId}/new-stop`)}
        className="flex w-[150px] items-center justify-center rounded-md border border-dashed border-gray-700"
      >
        <Icon icon={Plus} />
        <Text className="text-center text-xs">Plan your next step</Text>
      </TouchableOpacity>
      <ItemSeparator />
      <View className="flex w-[45px] items-center justify-center space-y-1">
        <Icon icon={Flag} />
        <Text className="text-center text-xs">01 Mar 2025</Text>
      </View>
    </View>
  )
}
