import { View } from "react-native"
import { FlashList } from "@shopify/flash-list"

import { SpotItem } from "../../../../components/SpotItem"
import { Spinner } from "../../../../components/ui/Spinner"
import { Text } from "../../../../components/ui/Text"
import { api } from "../../../../lib/api"
import { useParams } from "../../../router"

export function UserSpots() {
  const { params } = useParams<"UserScreen">()
  const { data: spots, isLoading } = api.spot.byUser.useQuery({ username: params.username?.toLowerCase().trim() })
  if (isLoading)
    return (
      <View className="flex items-center justify-center py-4">
        <Spinner />
      </View>
    )

  if (!spots)
    return (
      <View className="flex items-end justify-center py-4">
        <Text>No spots found</Text>
      </View>
    )

  return (
    <View className="min-h-full">
      <FlashList
        showsVerticalScrollIndicator={false}
        estimatedItemSize={376}
        ListEmptyComponent={<Text>No spots yet</Text>}
        // onEndReachedThreshold={0.8}
        // onEndReached={handleLoadMore}
        data={spots}
        ItemSeparatorComponent={() => <View className="h-6" />}
        renderItem={({ item }) => <SpotItem spot={item} />}
      />
    </View>
  )
}
