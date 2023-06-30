import { View } from "react-native"
import { Image } from "expo-image"

import { createImageUrl } from "@ramble/shared"

import { api } from "../lib/api"
import { interestOptions } from "../lib/interests"
import { Spinner } from "./ui/Spinner"
import { Text } from "./ui/Text"
import { User2 } from "lucide-react-native"

interface Props {
  username: string
}

export function UserProfile(props: Props) {
  const { data: user, isLoading } = api.user.profile.useQuery({ username: props.username })

  if (isLoading)
    return (
      <View className="flex items-center justify-center py-20">
        <Spinner />
      </View>
    )

  if (!user)
    return (
      <View className="px-4 py-20">
        <Text>User not found</Text>
      </View>
    )

  return (
    <View>
      <View className="flex flex-row items-center space-x-3">
        {user.avatar ? (
          <Image
            source={{ uri: createImageUrl(user.avatar) }}
            className="sq-20 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
          />
        ) : (
          <View className="sq-20 flex items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
            <User2 className="text-black dark:text-white" />
          </View>
        )}
        <View className="space-y-px">
          <Text className="text-xl">
            {user.firstName} {user.lastName}
          </Text>

          <View className="flex flex-row items-center space-x-2">
            {interestOptions
              .filter((i) => user[i.value as keyof typeof user])
              .map((interest) => (
                <View key={interest.value} className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                  <interest.Icon size={20} className="text-black dark:text-white" />
                </View>
              ))}
          </View>
        </View>
      </View>
      <Text>{user.bio}</Text>
    </View>
  )
}
