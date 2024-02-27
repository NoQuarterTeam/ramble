import { useLocalSearchParams } from "expo-router"
import { View } from "react-native"

import { ListItem } from "~/components/ListItem"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"

export default function UserLists() {
  const params = useLocalSearchParams<{ username: string }>()

  const { data: lists, isLoading } = api.list.allByUser.useQuery(
    { username: params.username?.toLowerCase().trim() || "" },
    { enabled: !!params.username },
  )

  if (isLoading)
    return (
      <View className="flex items-center justify-center py-4">
        <Spinner />
      </View>
    )

  if (!lists)
    return (
      <View className="flex items-end justify-center py-4">
        <Text>No lists yet</Text>
      </View>
    )

  return (
    <View>
      {lists.map((list) => (
        <View key={list.id} className="pb-2">
          <ListItem list={list} />
        </View>
      ))}
    </View>
  )
}
