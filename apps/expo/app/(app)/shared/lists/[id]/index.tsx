import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { Edit } from "lucide-react-native"

import { SpotItem } from "../../../../../components/SpotItem"
import { Button } from "../../../../../components/ui/Button"
import { Spinner } from "../../../../../components/ui/Spinner"
import { Text } from "../../../../../components/ui/Text"
import { api } from "../../../../../lib/api"
import { useMe } from "../../../../../lib/hooks/useMe"
import { useParams, useRouter } from "../../../../router"
import { ScreenView } from "../../../../../components/ui/ScreenView"

export function ListDetailScreen() {
  const { params } = useParams<"ListDetailScreen">()

  const { me } = useMe()

  const { data: list, isLoading } = api.list.detail.useQuery({ id: params?.id }, { enabled: !!params?.id })

  const navigation = useRouter()

  if (isLoading)
    return (
      <View className="flex items-center justify-center px-4 py-20">
        <Spinner />
      </View>
    )
  if (!list)
    return (
      <View className="flex items-center justify-center px-4 py-20">
        <Text>List not found</Text>
      </View>
    )
  return (
    <ScreenView
      title={list.name}
      rightElement={
        me?.id === list.creatorId && (
          <TouchableOpacity className="mb-1 p-1" onPress={() => navigation.push("EditListScreen", { id: list.id })}>
            <Edit size={20} className="text-black dark:text-white" />
          </TouchableOpacity>
        )
      }
    >
      <FlashList
        showsVerticalScrollIndicator={false}
        estimatedItemSize={100}
        contentContainerStyle={{ paddingVertical: 10 }}
        ListEmptyComponent={
          <View>
            <Text className="w-full py-4 text-xl">No spots yet</Text>
            <Button variant="outline" onPress={() => navigation.navigate("SpotsLayout")} className="w-full">
              Explore
            </Button>
          </View>
        }
        data={list.listSpots.map((l) => l.spot) || []}
        ItemSeparatorComponent={() => <View className="h-1" />}
        renderItem={({ item }) => <SpotItem spot={item} />}
      />
    </ScreenView>
  )
}
