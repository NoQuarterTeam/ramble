import { View } from "react-native"
import { FlashList } from "@shopify/flash-list"

import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"

import { UserItem } from "~/components/UserItem"
import { useLocalSearchParams } from "expo-router"

export default function UserFollowers() {
  const params = useLocalSearchParams<{ username: string }>()
  const { data, isLoading } = api.user.followers.useQuery({ username: params.username })

  return (
    <ScreenView title="Followers">
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
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={<Text className="text-center">No followers</Text>}
          renderItem={({ item }) => <UserItem user={item} />}
        />
      )}
    </ScreenView>
  )
}
