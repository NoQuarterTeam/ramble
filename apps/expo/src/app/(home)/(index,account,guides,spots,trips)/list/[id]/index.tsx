import { FlashList } from "@shopify/flash-list"
import { useLocalSearchParams, useRouter } from "expo-router"
import { TouchableOpacity, View } from "react-native"

import { SpotItem } from "~/components/SpotItem"
import { Button } from "~/components/ui/Button"
import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

export default function ListDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const { me } = useMe()
  const { data, isLoading } = api.list.detail.useQuery({ id: params.id })
  const router = useRouter()

  const list = data?.list
  const tab = useTabSegment()
  return (
    <ScreenView
      title={list?.name}
      rightElement={
        list &&
        me?.id === list.creatorId && (
          <TouchableOpacity
            className="sq-8 flex items-center justify-center"
            onPress={() => router.push(`/${tab}/list/${list.id}/edit`)}
          >
            <Text className="underline">Edit</Text>
          </TouchableOpacity>
        )
      }
    >
      {isLoading ? (
        <View className="flex items-center justify-center p-4">
          <Spinner />
        </View>
      ) : !list ? (
        <View className="flex items-center justify-center p-4">
          <Text>List not found</Text>
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
                Explore
              </Button>
            </View>
          }
          data={data.spots}
          ItemSeparatorComponent={() => <View className="h-6" />}
          renderItem={({ item }) => <SpotItem spot={item} />}
        />
      )}
      {data?.list && (!!data.bounds || !!data.center) && (
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
      )}
    </ScreenView>
  )
}
