import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"

import { SpotItem } from "../../../../../components/SpotItem"
import { Button } from "../../../../../components/ui/Button"
import { ScreenView } from "../../../../../components/ui/ScreenView"
import { Spinner } from "../../../../../components/ui/Spinner"
import { Text } from "../../../../../components/ui/Text"
import { api } from "../../../../../lib/api"
import { useMe } from "../../../../../lib/hooks/useMe"
import { useParams, useRouter } from "../../../../router"

export function ListDetailScreen() {
  const { params } = useParams<"ListDetailScreen">()
  const { me } = useMe()
  const { data, isLoading } = api.list.detail.useQuery({ id: params.id })
  const navigation = useRouter()

  const list = data?.list

  return (
    <ScreenView
      title={params.name}
      rightElement={
        list &&
        me?.id === list.creatorId && (
          <TouchableOpacity
            className="sq-8 flex items-center justify-center"
            onPress={() => navigation.push("EditListScreen", { id: list.id })}
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
              <Button variant="outline" onPress={() => navigation.navigate("MapLayout")} className="w-full">
                Explore
              </Button>
            </View>
          }
          data={data.spots}
          ItemSeparatorComponent={() => <View className="h-6" />}
          renderItem={({ item }) => <SpotItem spot={item} />}
        />
      )}
    </ScreenView>
  )
}
