import { TouchableOpacity, View } from "react-native"
import { Text } from "../../../components/Text"
import { api } from "../../../lib/api"
import { Link, useLocalSearchParams } from "expo-router"

import { Spinner } from "../../../components/Spinner"
import { Heading } from "../../../components/Heading"

export default function ProfileLists() {
  const { username } = useLocalSearchParams<{ username: string }>()

  const { data: lists, isLoading } = api.user.lists.useQuery({ username: username || "" }, { enabled: !!username })
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
  console.log({ lists })

  return (
    <View className="sq-40 flex-1 space-y-1 bg-red-500">
      <Heading>the fuck</Heading>
      {lists.map((list) => (
        <Link asChild key={list.id} href={`/${username}/lists/${list.id}`}>
          <TouchableOpacity activeOpacity={0.8} className="rounded-lg border border-gray-100 p-4 dark:border-gray-700">
            <Text className="text-xl">{list.name}</Text>
            <Text className="text-base">{list.description}</Text>
          </TouchableOpacity>
        </Link>
      ))}
    </View>
  )
}
