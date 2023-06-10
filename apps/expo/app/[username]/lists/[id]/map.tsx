import { TouchableOpacity, View } from "react-native"
import { useLocalSearchParams, useNavigation } from "expo-router"

import { Text } from "../../../../components/Text"
import { api } from "../../../../lib/api"
import { Spinner } from "../../../../components/Spinner"
import { Heading } from "../../../../components/Heading"
import { ChevronLeft, Map } from "lucide-react-native"
import { FlashList } from "@shopify/flash-list"
import { SpotItem } from "../../../../components/SpotItem"
import { Link } from "../../../../components/Link"

export default function ListDetailMap() {
  const { id, username } = useLocalSearchParams<{ id: string; username: string }>()

  const { data: list, isLoading } = api.list.detail.useQuery(
    { id: id || "", username: username || "" },
    { enabled: !!id && !!username },
  )
  const navigation = useNavigation()

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
      <Link asChild href={`/${username}/lists/${id}/map`}>
        <TouchableOpacity className="absolute bottom-3 left-1/2 -ml-[50px] flex w-[100px] flex-row items-center justify-center space-x-2 rounded-full bg-gray-800 p-3 dark:bg-white">
          <Map size={20} className="text-white dark:text-black" />
          <Text className="text-white dark:text-black">Map</Text>
        </TouchableOpacity>
      </Link>
    </View>
  )
}
