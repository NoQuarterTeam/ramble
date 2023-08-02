import { View } from "react-native"
import { FlashList } from "@shopify/flash-list"

import { ScreenView } from "../../../../components/ui/ScreenView"
import { Spinner } from "../../../../components/ui/Spinner"
import { Text } from "../../../../components/ui/Text"
import { api } from "../../../../lib/api"
import { useParams } from "../../../router"
import { UserItem } from "./UserItem"

export function UserFollowing() {
  const { params } = useParams<"UserFollowing">()
  const { data, isLoading } = api.user.following.useQuery({ username: params.username })

  return (
    <ScreenView title="Following">
      {isLoading ? (
        <View className="flex items-center justify-center py-4">
          <Spinner />
        </View>
      ) : !data ? (
        <View className="flex items-end justify-center py-4">
          <Text>Not found</Text>
        </View>
      ) : (
        <FlashList
          data={data}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={56}
          ItemSeparatorComponent={() => <View className="h-4" />}
          keyExtractor={(item) => item.id.toString() + Math.random()}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={<Text className="text-center">Not following anyone</Text>}
          renderItem={({ item }) => <UserItem user={item} />}
        />
      )}
    </ScreenView>
  )
}
