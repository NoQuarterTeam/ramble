import { TouchableOpacity, View } from "react-native"
import { useRouter } from "expo-router"
import { User2 } from "lucide-react-native"

import { type Trip, type User } from "@ramble/database/types"
import { createImageUrl, join } from "@ramble/shared"

import { Icon } from "./Icon"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"
import { useFeedbackActivity } from "./FeedbackCheck"
import dayjs from "dayjs"

interface Props {
  trip: Pick<Trip, "id" | "name" | "startDate" | "endDate"> & {
    creator: Pick<User, "avatar" | "avatarBlurHash" | "firstName" | "lastName">
  }
  isActive?: boolean
}

export function TripItem({ trip, isActive }: Props) {
  const router = useRouter()
  const increment = useFeedbackActivity((s) => s.increment)
  return (
    <TouchableOpacity
      onPress={() => {
        increment()
        router.push(`/(home)/(trips)/trips/${trip.id}`)
      }}
      activeOpacity={0.8}
      className={join("rounded-xs border border-gray-200 p-4 dark:border-gray-700", isActive && "border-primary-500")}
    >
      <View className="flex flex-row items-center space-x-2">
        {isActive && (
          <View className="bg-primary flex items-center justify-center rounded-full px-1 py-0.5">
            <Text className="text-xxs font-600 text-center text-white">CURRENT</Text>
          </View>
        )}
        <Text className="text-xl">{trip.name}</Text>
      </View>

      <View className="flex flex-row items-end justify-between">
        <Text className="text-sm">
          {dayjs(trip.startDate).format("D MMM YY")} → {dayjs(trip.endDate).format("D MMM YY")}
        </Text>
        <View className="flex flex-row items-center space-x-1">
          {trip.creator.avatar ? (
            <OptimizedImage
              width={40}
              height={40}
              placeholder={trip.creator.avatarBlurHash}
              source={{ uri: createImageUrl(trip.creator.avatar) }}
              className="sq-6 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
            />
          ) : (
            <View className="sq-6 flex items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
              <Icon icon={User2} size={14} />
            </View>
          )}
          <Text className="text-base">{trip.creator.firstName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
