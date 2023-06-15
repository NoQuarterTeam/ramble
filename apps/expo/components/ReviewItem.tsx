import { TouchableOpacity, View } from "react-native"
import dayjs from "dayjs"
import { Image } from "expo-image"

import { Star } from "lucide-react-native"

import { type Review, type User } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { Text } from "./Text"
import { useRouter } from "../app/router"

export function ReviewItem({
  review,
}: {
  review: Pick<Review, "id" | "createdAt" | "description" | "rating"> & {
    user: Pick<User, "avatar" | "firstName" | "lastName" | "username">
  }
}) {
  const { push } = useRouter()
  return (
    <View className="space-y-2 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <View className="flex flex-row justify-between">
        <TouchableOpacity
          onPress={() => push("UsernameLayout", { username: review.user.username })}
          activeOpacity={0.8}
          className="flex flex-row space-x-2"
        >
          <Image
            source={{ uri: createImageUrl(review.user.avatar) }}
            className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700"
          />

          <View>
            <Text>
              {review.user.firstName} {review.user.lastName}
            </Text>
            <Text className="text-sm   opacity-70">{dayjs(review.createdAt).format("DD/MM/YYYY")}</Text>
          </View>
        </TouchableOpacity>

        <View className="flex flex-row items-center space-x-2">
          <Star size={20} className="text-black dark:text-white" />
          <Text className="text-sm">5.0</Text>
        </View>
      </View>
      <Text>{review.description}</Text>
    </View>
  )
}
