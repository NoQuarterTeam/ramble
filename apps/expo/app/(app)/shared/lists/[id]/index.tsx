import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { ChevronLeft, Edit } from "lucide-react-native"

import { Button } from "../../../../../components/Button"
import { Heading } from "../../../../../components/Heading"
import { Spinner } from "../../../../../components/Spinner"
import { SpotItem } from "../../../../../components/SpotItem"
import { Text } from "../../../../../components/Text"
import { api } from "../../../../../lib/api"
import { useMe } from "../../../../../lib/hooks/useMe"
import { useParams, useRouter } from "../../../../router"

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
    <View className="h-full">
      <View className="relative flex-1 px-4 pt-20">
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center space-x-2">
            {navigation.canGoBack() && (
              <TouchableOpacity onPress={navigation.goBack} activeOpacity={0.8}>
                <ChevronLeft className="text-black dark:text-white" />
              </TouchableOpacity>
            )}

            <Heading className="text-3xl">{list.name}</Heading>
          </View>
          {me?.id === list.creatorId && (
            <TouchableOpacity onPress={() => navigation.push("EditListScreen", { id: list.id })}>
              <Edit className="text-black dark:text-white" />
            </TouchableOpacity>
          )}
        </View>

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
      </View>
    </View>
  )
}
