import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { Link, useLocalSearchParams, useRouter } from "expo-router"

import { Button } from "~/components/ui/Button"
import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"
import { TripSpotItem } from "~/components/TripSpotItem"

export default function TripDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const { me } = useMe()
  const { data: trip, isLoading } = api.trip.detail.useQuery({ id: params.id })
  const router = useRouter()

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
      {trip && (
        <Link push href={`/(home)/(trips)/trips/${trip.id}/add`} asChild>
          <Button>Add item</Button>
        </Link>
      )}
      {isLoading ? (
        <View className="flex items-center justify-center p-4">
          <Spinner />
        </View>
      ) : !trip ? (
        <View className="flex items-center justify-center p-4">
          <Text>Trip not found</Text>
        </View>
      ) : (
        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={100}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={
            <View>
              <Text className="w-full py-4 text-center text-xl">No spots yet</Text>
              <Button variant="outline" onPress={() => router.navigate("/")} className="w-full">
                Add a spot to your trip!
              </Button>
            </View>
          }
          data={trip.items}
          ItemSeparatorComponent={() => <View className="h-6" />}
          renderItem={({ item }) => item.spot && <TripSpotItem spot={item.spot} />}
        />
      )}
      {/* {data?.list && (!!data.bounds || !!data.center) && (
        <View pointerEvents="box-none" className="absolute bottom-4 left-4 flex w-full flex-row items-center justify-center">
          <Button
            onPress={() =>
              router.push(
                `/${tab}/list/${data.list.id}/map?${new URLSearchParams({
                  initialBounds: data.bounds?.join(",") || "",
                  initialCenter: data.center?.join(",") || "",
                })}`,
              )
            }
            className="rounded-full"
            size="sm"
          >
            Map
          </Button>
        </View>
      )} */}
    </ScreenView>
  )
}
