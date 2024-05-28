import isBetween from "dayjs/plugin/isBetween"
import { useRouter } from "expo-router"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"
dayjs.extend(isBetween)

import dayjs from "dayjs"

import type { Trip, TripMedia, User } from "@ramble/database/types"
import { createAssetUrl, join } from "@ramble/shared"

import { Image } from "expo-image"
import { useFeedbackActivity } from "./FeedbackCheck"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"

const MAX_FLAGS = 11

interface Props {
  trip: Pick<Trip, "id" | "name" | "startDate" | "endDate"> & {
    creator: Pick<User, "id" | "avatar" | "avatarBlurHash" | "firstName" | "lastName">
  } & {
    users: Pick<User, "id" | "firstName" | "lastName" | "avatar" | "avatarBlurHash">[]
  } & {
    media: Pick<TripMedia, "id" | "path" | "thumbnailPath">[]
  } & {
    countryFlags: string[]
  }
}
const today = dayjs()

export function TripItem({ trip }: Props) {
  const router = useRouter()
  const increment = useFeedbackActivity((s) => s.increment)
  const isActive = today.isBetween(trip.startDate, trip.endDate)

  const daysToGo = dayjs(trip.startDate).diff(today, "days")
  return (
    <TouchableOpacity
      onPress={() => {
        increment()
        router.push(`/(home)/(trips)/trip/${trip.id}`)
      }}
      activeOpacity={0.8}
      className={join("space-y-4 rounded-xs border border-gray-200 p-4 dark:border-gray-700", isActive && "border-primary-500")}
    >
      <View className="flex flex-row justify-between">
        <View className="flex-shrink">
          <Text className="text-xl" numberOfLines={1}>
            {trip.name}
          </Text>
          {trip.media.length > 0 && (
            <View className="relative mt-2" style={{ height: 40 }}>
              {trip.media.map((media, i) => (
                <Image
                  className="absolute top-0 rounded border-background bg-gray-200 dark:bg-gray-700"
                  key={media.id}
                  source={{ uri: createAssetUrl(media.thumbnailPath || media.path) }}
                  style={{
                    width: 40,
                    height: 40,
                    borderWidth: 1.5,
                    zIndex: -1 * i,
                    left: i * 25,
                    transform: [{ scale: 1 - i * 0.1 }, { rotate: `${i === 0 ? -4 : i * 10}deg` }],
                  }}
                />
              ))}
            </View>
          )}
        </View>
        <View>
          {today.isBefore(trip.startDate) ? (
            <View className="flex items-center justify-center rounded-full bg-green-800 px-2 py-0.5">
              <Text className="text-center font-600 text-white text-xs">
                {daysToGo} day{daysToGo === 1 ? "" : "s"} to go
              </Text>
            </View>
          ) : today.isAfter(trip.endDate) ? null : (
            <View className="flex items-center justify-center rounded-full bg-primary px-2 py-0.5">
              <Text className="text-center font-600 text-white text-xs">CURRENT</Text>
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

      {trip.countryFlags.length > 0 && (
        <View className="flex flex-row gap-1 items-center flex-wrap">
          {trip.countryFlags.slice(0, MAX_FLAGS).map((flag) => (
            <Text key={flag} className="text-lg">
              {flag}
            </Text>
          ))}
          {trip.countryFlags.length > MAX_FLAGS && (
            <View>
              <Text className="opacity-70">+{trip.countryFlags.length - MAX_FLAGS}</Text>
            </View>
          )}
        </View>
      )}
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
              source={{ uri: createAssetUrl(trip.creator.avatar) }}
              className="sq-7 rounded-full border border-background object-cover dark:border-background-dark"
            />
          ) : (
            <View
              style={{ zIndex: 1 }}
              className="sq-7 flex items-center justify-center rounded-full border border-background bg-gray-100 dark:border-background-dark dark:bg-gray-500"
            >
              <Text className="font-600 text-xs">
                {trip.creator.firstName[0]}
                {trip.creator.lastName[0]}
              </Text>
            </View>
          )}

          <View className="flex flex-row items-center">
            {shownUsers.map((user, i) => (
              <React.Fragment key={user.id}>
                {user.avatar ? (
                  <OptimizedImage
                    width={30}
                    height={30}
                    placeholder={user.avatarBlurHash}
                    source={{ uri: createAssetUrl(user.avatar) }}
                    style={{ zIndex: i * -1 }}
                    className="sq-6 -ml-1.5 rounded-full border border-background object-cover dark:border-background-dark"
                  />
                ) : (
                  <View
                    style={{ zIndex: i * -1 }}
                    className="sq-6 -ml-1.5 flex items-center justify-center rounded-full border border-background bg-gray-200 object-cover dark:border-background-dark dark:bg-gray-700"
                  >
                    <Text className="font-600 text-xxs">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </Text>
                  </View>
                )}
              </React.Fragment>
            ))}
            {remainingUsers > 0 && (
              <View
                style={{ zIndex: -5 }}
                className="sq-6 -ml-1.5 flex items-center justify-center rounded-full border border-background bg-gray-200 dark:border-background-dark dark:bg-gray-700"
              >
                <Text className="font-600 text-xxs">+{remainingUsers}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </>
  )
}
