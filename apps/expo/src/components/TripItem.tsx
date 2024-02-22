import { TouchableOpacity, View } from "react-native"
import isBetween from "dayjs/plugin/isBetween"
import { useRouter } from "expo-router"
import { User2 } from "lucide-react-native"
dayjs.extend(isBetween)

import dayjs from "dayjs"

import { type Trip, type User } from "@ramble/database/types"
import { createImageUrl, join } from "@ramble/shared"

import { useFeedbackActivity } from "./FeedbackCheck"
import { Icon } from "./Icon"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"

interface Props {
  trip: Pick<Trip, "id" | "name" | "startDate" | "endDate"> & {
    creator: Pick<User, "avatar" | "avatarBlurHash" | "firstName" | "lastName">
  }
}
const today = dayjs()

export function TripItem({ trip }: Props) {
  const router = useRouter()
  const increment = useFeedbackActivity((s) => s.increment)
  const isActive = today.isBetween(trip.startDate, trip.endDate)
  return (
    <TouchableOpacity
      onPress={() => {
        increment()
        router.push(`/(home)/(trips)/trips/${trip.id}`)
      }}
      activeOpacity={0.8}
      className={join("rounded-xs space-y-4 border border-gray-200 p-4 dark:border-gray-700", isActive && "border-primary-500")}
    >
      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-row items-center space-x-2">
          <Text className="text-xl">{trip.name}</Text>
        </View>
        {today.isBefore(trip.startDate) ? (
          <View className="flex items-center justify-center rounded-full bg-green-800 px-2 py-0.5">
            <Text className="font-600 text-center text-xs text-white">
              {dayjs(trip.startDate).diff(today, "days")} days to go
            </Text>
          </View>
        ) : today.isAfter(trip.endDate) ? null : (
          <View className="bg-primary flex items-center justify-center rounded-full px-2 py-0.5">
            <Text className="font-600 text-center text-xs text-white">CURRENT</Text>
          </View>
        )}
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
