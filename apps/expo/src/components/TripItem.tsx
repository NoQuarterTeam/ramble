import isBetween from "dayjs/plugin/isBetween"
import { useRouter } from "expo-router"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"
dayjs.extend(isBetween)

import dayjs from "dayjs"

import { type Trip, type User } from "@ramble/database/types"
import { createImageUrl, join } from "@ramble/shared"

import { useFeedbackActivity } from "./FeedbackCheck"

import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"

interface Props {
  trip: Pick<Trip, "id" | "name" | "startDate" | "endDate"> & {
    creator: Pick<User, "id" | "avatar" | "avatarBlurHash" | "firstName" | "lastName">
  } & {
    users: Pick<User, "id" | "firstName" | "lastName" | "avatar" | "avatarBlurHash">[]
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
      <View className="flex flex-row justify-between">
        <View className="">
          <Text className="text-xl">{trip.name}</Text>
        </View>
        <View>
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
      </View>

      <View className="flex flex-row items-end justify-between">
        <Text className="text-sm">
          {dayjs(trip.startDate).format("D MMM YY")} → {dayjs(trip.endDate).format("D MMM YY")}
        </Text>
        <TripUsers trip={trip} />
      </View>
    </TouchableOpacity>
  )
}

function TripUsers({ trip }: Props) {
  const users = React.useMemo(() => trip.users.filter((u) => u.id !== trip.creator.id), [trip.users, trip.creator.id])
  const shownUsers = users.slice(0, 3)
  const remainingUsers = users.length - shownUsers.length
  return (
    <>
      {users.length > 0 && (
        <View className="flex flex-row items-center">
          {trip.creator.avatar ? (
            <OptimizedImage
              width={40}
              height={40}
              style={{ zIndex: 1 }}
              placeholder={trip.creator.avatarBlurHash}
              source={{ uri: createImageUrl(trip.creator.avatar) }}
              className="sq-7 border-background dark:border-background-dark rounded-full border object-cover"
            />
          ) : (
            <View
              style={{ zIndex: 1 }}
              className="sq-7 border-background dark:border-background-dark flex items-center justify-center rounded-full border bg-gray-100 dark:bg-gray-500"
            >
              <Text className="font-600 text-xs">
                {trip.creator.firstName[0]}
                {trip.creator.lastName[0]}
              </Text>
            </View>
          )}

          <View className="flex flex-row items-center">
            {shownUsers.map((user, i) =>
              user.avatar ? (
                <OptimizedImage
                  width={30}
                  height={30}
                  key={user.id}
                  placeholder={user.avatarBlurHash}
                  source={{ uri: createImageUrl(user.avatar) }}
                  style={{ zIndex: i * -1 }}
                  className="sq-6 border-background dark:border-background-dark -ml-1.5 rounded-full border object-cover"
                />
              ) : (
                <View
                  key={user.id}
                  style={{ zIndex: i * -1 }}
                  className="sq-6 border-background dark:border-background-dark -ml-1.5 flex items-center justify-center rounded-full border bg-gray-200 object-cover dark:bg-gray-700"
                >
                  <Text className="text-xxs font-600">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </Text>
                </View>
              ),
            )}
            {remainingUsers > 0 && (
              <View
                style={{ zIndex: -5 }}
                className="sq-6 border-background dark:border-background-dark -ml-1.5 flex items-center justify-center rounded-full border bg-gray-200 dark:bg-gray-700"
              >
                <Text className="text-xxs font-600">+{remainingUsers}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </>
  )
}
