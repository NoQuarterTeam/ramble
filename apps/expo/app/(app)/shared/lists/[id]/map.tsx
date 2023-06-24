import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { ChevronLeft } from "lucide-react-native"

import { SpotItem } from "../../../../../components/SpotItem"
import { Heading } from "../../../../../components/ui/Heading"
import { Spinner } from "../../../../../components/ui/Spinner"
import { Text } from "../../../../../components/ui/Text"
import { api } from "../../../../../lib/api"
import { useParams, useRouter } from "../../../../router"

export function ListDetailMapScreen() {
  const { params } = useParams<"ListDetailMapScreen">()

  const { data: list, isLoading } = api.list.detail.useQuery({ id: params.id })
  const navigation = useRouter()

  if (isLoading)
    return (
      <View className="px-4 py-20">
        <Spinner />
      </View>
    )
  if (!list)
    return (
      <View className="px-4 py-20">
        <Text>List not found</Text>
      </View>
    )
  return (
    <View className="h-full">
      <View className="relative flex-1 px-4 pt-20">
        <View className="flex flex-row items-center space-x-2">
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={navigation.goBack} activeOpacity={0.8}>
              <ChevronLeft className="text-black dark:text-white" />
            </TouchableOpacity>
          )}

          <Heading className="text-3xl">{list.name}</Heading>
        </View>

        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={100}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={<Text>Empty</Text>}
          data={list.listSpots.map((l) => l.spot) || []}
          ItemSeparatorComponent={() => <View className="h-1" />}
          renderItem={({ item }) => <SpotItem spot={item} />}
        />
      </View>
    </View>
  )
}
