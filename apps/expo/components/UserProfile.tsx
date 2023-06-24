import { View } from "react-native"
import { Image } from "expo-image"
import { Bike, Dog, Footprints, Mountain, Waves } from "lucide-react-native"

import { createImageUrl } from "@ramble/shared"

import { api } from "../lib/api"
import { Icons } from "./ui/Icons"
import { Spinner } from "./ui/Spinner"
import { Text } from "./ui/Text"

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
        <Image
          source={{ uri: createImageUrl(user.avatar) }}
          className="sq-20 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
        />
        <View className="space-y-px">
          <Text className="text-xl">
            {user.firstName} {user.lastName}
          </Text>

          <View className="flex flex-row items-center space-x-2">
            {user.isPetOwner && (
              <View className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                <Dog size={20} className="text-black dark:text-white" />
              </View>
            )}
            {user.isSurfer && (
              <View className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                <Icons.Surf size={20} className="text-black dark:text-white" />
              </View>
            )}
            {user.isClimber && (
              <View className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                <Mountain size={20} className="text-black dark:text-white" />
              </View>
            )}
            {user.isHiker && (
              <View className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                <Footprints size={20} className="text-black dark:text-white" />
              </View>
            )}
            {user.isMountainBiker && (
              <View className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                <Bike size={20} className="text-black dark:text-white" />
              </View>
            )}
            {user.isPaddleBoarder && (
              <View className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                <Waves size={20} className="text-black dark:text-white" />
              </View>
            )}
          </View>
        </View>
      </View>
      <Text>{user.bio}</Text>
    </View>
  )
}
