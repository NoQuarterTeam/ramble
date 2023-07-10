import { View } from "react-native"
import { FlashList } from "@shopify/flash-list"

import { ScreenView } from "../../../../components/ui/ScreenView"
import { Spinner } from "../../../../components/ui/Spinner"
import { Text } from "../../../../components/ui/Text"
import { api } from "../../../../lib/api"
import { useParams } from "../../../router"
import { UserItem } from "./UserItem"

export function UserFollowers() {
  const { params } = useParams<"UserFollowers">()
  const { data, isLoading } = api.user.followers.useQuery({ username: params.username })
  if (isLoading)
    return (
      <View className="flex items-center justify-center pt-16">
        <Spinner />
      </View>
    )

  if (!data)
    return (
      <View className="flex items-end justify-center pt-16">
        <Text>No user found</Text>
      </View>
    )

  return (
    <ScreenView title="Followers">
      <FlashList
        data={data}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={56}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerStyle={{ paddingVertical: 10 }}
        ListEmptyComponent={<Text className="text-center">No followers</Text>}
        renderItem={({ item }) => <UserItem user={item} />}
      />
    </ScreenView>
  )
}
