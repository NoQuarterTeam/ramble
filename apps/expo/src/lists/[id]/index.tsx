import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"

import { SpotItem } from "../../../../components/SpotItem"
import { Button } from "../../../../components/ui/Button"
import { ScreenView } from "../../../../components/ui/ScreenView"
import { Spinner } from "../../../../components/ui/Spinner"
import { Text } from "../../../../components/ui/Text"
import { api } from "../../../../lib/api"
import { useMe } from "../../../../lib/hooks/useMe"
import { useParams, useRouter } from "../../../router"

export function ListDetailScreen() {
  const { params } = useParams<"ListDetailScreen">()
  const { me } = useMe()
  const { data, isLoading } = api.list.detail.useQuery({ id: params.id })
  const navigate = useRouter()

  const list = data?.list

  return (
    <ScreenView
      title={params.name}
      rightElement={
        list &&
        me?.id === list.creatorId && (
          <TouchableOpacity
            className="sq-8 flex items-center justify-center"
            onPress={() => navigate.push("EditListScreen", { id: list.id })}
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
              <Button variant="outline" onPress={() => navigate.navigate("MapLayout")} className="w-full">
                Explore
              </Button>
            </View>
          }
          data={data.spots}
          ItemSeparatorComponent={() => <View className="h-6" />}
          renderItem={({ item }) => <SpotItem spot={item} />}
        />
      )}
      {data && (!!data.bounds || !!data.center) && (
        <View pointerEvents="box-none" className="absolute bottom-4 left-4 flex w-full flex-row items-center justify-center">
          <Button
            onPress={() =>
              navigate.push("ListDetailMapScreen", { ...params, initialBounds: data.bounds, initialCenter: data.center })
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
