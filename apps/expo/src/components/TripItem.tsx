import isBetween from "dayjs/plugin/isBetween"
import { useRouter } from "expo-router"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"
dayjs.extend(isBetween)
import { createAssetUrl, join } from "@ramble/shared"
import dayjs from "dayjs"
import { Image } from "expo-image"
import type { RouterOutputs } from "~/lib/api"
import { FULL_WEB_URL } from "~/lib/config"
import { useFeedbackActivity } from "./FeedbackCheck"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"

const MAX_FLAGS = 11

interface Props {
  trip: RouterOutputs["trip"]["mine"][number]
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
      className={join("rounded-sm overflow-hidden border border-gray-200 dark:border-gray-700", isActive && "border-primary-500")}
    >
      {today.isBefore(trip.startDate) ? (
        <View className="flex items-center justify-center bg-green-800 py-0.5">
          <Text className="text-center font-600 text-white text-xs">
            {daysToGo} day{daysToGo === 1 ? "" : "s"} to go
          </Text>
        </View>
      ) : today.isAfter(trip.endDate) ? null : (
        <View className="flex items-center justify-center bg-primary py-0.5">
          <Text className="text-center font-600 text-white text-xs">CURRENT</Text>
        </View>
      )}

      <View className="space-y-3 p-3">
        <View className="flex flex-row justify-between items-start">
          <View>
            <Text className="text-2xl font-500" numberOfLines={1}>
              {trip.name}
            </Text>
            <Text className="text-xs">
              {dayjs(trip.startDate).format("D MMM YY")} → {dayjs(trip.endDate).format("D MMM YY")}
            </Text>
          </View>
          <View className="flex flex-row items-end justify-between">
            <TripUsers trip={trip} />
          </View>
        </View>
        {trip.media.length > 0 && (
          <View className="relative flex flex-row space-x-1">
            {trip.media.map((media) => (
              <Image
                className="rounded-xs bg-gray-200 dark:bg-gray-700"
                key={media.id}
                source={{ uri: createAssetUrl(media.thumbnailPath || media.path) }}
                style={{ width: 40, height: 40 }}
              />
            ))}
          </View>
        )}
      </View>
      {trip.countryFlags.length > 0 && (
        <View className="flex p-3 border-t border-gray-100 dark:border-gray-700 flex-row space-x-1 justify-start items-start">
          {trip.countryCodes.slice(0, MAX_FLAGS).map((code) => (
            <Image
              key={code}
              style={{ height: 16, width: 20 }}
              contentFit="contain"
              source={{ uri: `${FULL_WEB_URL}/flags/${code}.png` }}
            />
          ))}
          {trip.countryCodes.length > MAX_FLAGS && (
            <View>
              <Text className="opacity-70">+{trip.countryCodes.length - MAX_FLAGS}</Text>
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
