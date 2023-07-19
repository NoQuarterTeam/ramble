import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { PlusCircle } from "lucide-react-native"

import { SpotItem } from "../../../components/SpotItem"
import { Heading } from "../../../components/ui/Heading"
import { Spinner } from "../../../components/ui/Spinner"
import { Text } from "../../../components/ui/Text"
import { api } from "../../../lib/api"
import { useRouter } from "../../router"

export function LatestScreen() {
  const { push } = useRouter()
  const { data: spots, isLoading } = api.spot.latest.useQuery()

  if (isLoading)
    return (
      <View className="flex items-center justify-center pt-16">
        <Spinner />
      </View>
    )
  return (
    <View className="h-full">
      <View className="relative flex-1 px-4 pt-16">
        <View className="flex flex-row justify-between">
          <Heading className="pb-1 text-3xl">Latest</Heading>

          <TouchableOpacity onPress={() => push("NewSpotLayout")} className="p-2">
            <PlusCircle className="text-black dark:text-white" />
          </TouchableOpacity>
        </View>

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
    </View>
  )
}
