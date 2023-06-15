import { View } from "react-native"
import { Text } from "../../components/Text"
import { api } from "../../lib/api"
import { useLocalSearchParams } from "expo-router"

import { Spinner } from "../../components/Spinner"
import { ListItem } from "../../components/ListItem"

export default function ProfileLists() {
  const { username } = useLocalSearchParams<{ username: string }>()

  const { data: lists, isLoading } = api.user.lists.useQuery({ username: username || "" }, { enabled: !!username })

  if (isLoading)
    return (
      <View className="flex items-center justify-center py-4">
        <Spinner />
      </View>
    )

  if (!lists || !username)
    return (
      <View className="flex items-end justify-center py-4">
        <Text>No lists yet</Text>
      </View>
    )

  return (
    <View>
      {lists.map((list) => (
        <View key={list.id} className="mb-1">
          <ListItem list={list} />
        </View>
      ))}
    </View>
  )
}
