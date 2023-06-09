import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useRouter } from "expo-router"
import { Map } from "lucide-react-native"

import { Heading } from "../../components/Heading"
import { SpotItem } from "../../components/SpotItem"
import { Text } from "../../components/Text"
import { api } from "../../lib/api"

export default function Latest() {
  const router = useRouter()
  const { data: spots, isLoading } = api.spot.latest.useQuery()

  if (isLoading) return null
  return (
    <View className="h-full">
      <View className="relative flex-1 px-4 pt-20">
        <Heading className="pb-1 text-3xl">Latest</Heading>

        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={100}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={<Text>Empty</Text>}
          data={spots || []}
          ItemSeparatorComponent={() => <View className="h-1" />}
          renderItem={({ item }) => <SpotItem spot={item} />}
        />
      </View>
      <TouchableOpacity
        onPress={() => router.push("/(app)")}
        className="absolute bottom-3 left-1/2 -ml-[50px] flex w-[100px] flex-row items-center justify-center space-x-2 rounded-full bg-gray-800 p-3 dark:bg-white"
      >
        <Map size={20} className="text-white dark:text-black" />
        <Text className="text-white dark:text-black">Map</Text>
      </TouchableOpacity>
    </View>
  )
}
