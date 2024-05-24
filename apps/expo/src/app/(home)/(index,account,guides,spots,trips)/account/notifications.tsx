import { createAssetUrl } from "@ramble/shared"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import utc from "dayjs/plugin/utc"
import { type Href, Link } from "expo-router"
import { User2 } from "lucide-react-native"
import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { type RouterOutputs, api } from "~/lib/api"
import { useTabSegment } from "~/lib/hooks/useTabSegment"
dayjs.extend(relativeTime)
dayjs.extend(utc)

export default function AccountNotificationsScreen() {
  const { data, isLoading } = api.notification.all.useQuery()

  const utils = api.useUtils()
  const { mutate } = api.notification.markSeed.useMutation({
    onSuccess: () => {
      utils.notification.unreadCount.refetch()
    },
  })

  const isDone = React.useRef(false)
  // biome-ignore lint/correctness/useExhaustiveDependencies: allow
  React.useEffect(() => {
    ;(async () => {
      if (isDone.current) return
      isDone.current = true
      await new Promise((resolve) => setTimeout(resolve, 1000))
      mutate()
    })()
  }, [])

  return (
    <ScreenView title="notifications">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="flex items-center justify-center p-4">
            <Spinner />
          </View>
        ) : (
          data?.map((userNotification) => <NotificationType key={userNotification.id} userNotification={userNotification} />)
        )}
      </ScrollView>
    </ScreenView>
  )
}

function NotificationItem({
  leftElement,
  body,
  href,
  rightElement,
  userNotification,
}: {
  leftElement: React.ReactNode
  body: React.ReactNode
  href: Href<string>
  rightElement?: React.ReactNode
  userNotification: RouterOutputs["notification"]["all"][0]
}) {
  const timeAgo = getTimeAgo(userNotification.createdAt)
  return (
    <View className="p-1.5 mb-1 flex flex-row justify-between space-x-3">
      <View className="flex flex-1 flex-row space-x-3">
        {leftElement}
        <Link push asChild href={href}>
          <TouchableOpacity className="flex-1 items-center flex-row">
            <Text className="flex-1">
              {body}
              <Text className="opacity-60"> {timeAgo}</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
      {rightElement}
    </View>
  )
}

function NotificationType({ userNotification }: { userNotification: RouterOutputs["notification"]["all"][0] }) {
  const tab = useTabSegment()
  const initiator = userNotification.notification.initiator
  const type = userNotification.notification.type
  switch (type) {
    case "TRIP_SPOT_ADDED":
    case "TRIP_STOP_ADDED":
    case "TRIP_MEDIA_ADDED": {
      const body =
        type === "TRIP_MEDIA_ADDED"
          ? "added some images and videos to"
          : type === "TRIP_STOP_ADDED"
            ? "added a new stop to"
            : "added a new spot to"

      return (
        <NotificationItem
          userNotification={userNotification}
          leftElement={<UserAvatarNotification user={userNotification.notification.initiator} />}
          href={`/${tab}/trip/${userNotification.notification.trip?.id}` as Href<string>}
          body={
            <>
              <Text className="font-600">{initiator.username}</Text> {body}{" "}
              <Text className="font-600">{userNotification.notification.trip?.name}</Text>.
            </>
          }
        />
      )
    }
    case "SPOT_VERIFIED":
      return (
        <NotificationItem
          userNotification={userNotification}
          leftElement={<UserAvatarNotification user={userNotification.notification.initiator} />}
          href={`/${tab}/spot/${userNotification.notification.spot?.id}` as Href<string>}
          body={
            <>
              <Text className="font-600">{initiator.username}</Text> just verified your spot:{" "}
              <Text className="font-600">{userNotification.notification.spot?.name}</Text>.
            </>
          }
          rightElement={
            userNotification.notification.spot?.cover && (
              <Link push asChild href={`/${tab}/spot/${userNotification.notification.spot?.id}`}>
                <TouchableOpacity>
                  <OptimizedImage
                    placeholder={userNotification.notification.spot?.cover.blurHash}
                    style={{ width: 60, height: 40 }}
                    className="rounded"
                    source={{ uri: createAssetUrl(userNotification.notification.spot.cover.path) }}
                    width={140}
                    height={10}
                  />
                </TouchableOpacity>
              </Link>
            )
          }
        />
      )
    case "SPOT_ADDED_TO_TRIP":
    case "SPOT_ADDED_TO_LIST":
    case "SPOT_REVIEWED": {
      const body =
        type === "SPOT_ADDED_TO_TRIP"
          ? "added your spot to their trip"
          : type === "SPOT_ADDED_TO_LIST"
            ? "added your spot to their list"
            : "reviewed your spot"
      return (
        <NotificationItem
          userNotification={userNotification}
          leftElement={<UserAvatarNotification user={userNotification.notification.initiator} />}
          href={`/${tab}/spot/${userNotification.notification.spot?.id}` as Href<string>}
          body={
            <>
              <Text className="font-600">{initiator.username}</Text> {body}
            </>
          }
          rightElement={
            userNotification.notification.spot?.cover && (
              <Link push asChild href={`/${tab}/spot/${userNotification.notification.spot?.id}`}>
                <TouchableOpacity>
                  <OptimizedImage
                    placeholder={userNotification.notification.spot?.cover.blurHash}
                    style={{ width: 60, height: 40 }}
                    className="rounded"
                    source={{ uri: createAssetUrl(userNotification.notification.spot.cover.path) }}
                    width={140}
                    height={10}
                  />
                </TouchableOpacity>
              </Link>
            )
          }
        />
      )
    }
    case "USER_FOLLOWED": {
      const utils = api.useUtils()
      const { mutate } = api.user.toggleFollow.useMutation({
        onMutate: () => {
          utils.notification.all.setData(undefined, (prev) =>
            !prev
              ? prev
              : prev.map((un) =>
                  un.id === userNotification.id
                    ? {
                        ...un,
                        notification: {
                          ...un.notification,
                          initiator: {
                            ...un.notification.initiator,
                            followers: un.notification.initiator.followers.length === 0 ? [{ id: "1" }] : [],
                          },
                        },
                      }
                    : un,
                ),
          )
        },
      })
      return (
        <NotificationItem
          userNotification={userNotification}
          leftElement={<UserAvatarNotification user={userNotification.notification.initiator} />}
          href={`/${tab}/${userNotification.notification.initiator.username}/(profile)` as Href<string>}
          body={
            <>
              <Text className="font-600">{initiator.username}</Text> started following you.
            </>
          }
          rightElement={
            <View className="h-[40px] flex items-center justify-center">
              <Button
                size="sm"
                className="h-8 w-[85px]"
                variant={initiator.followers.length === 0 ? "primary" : "secondary"}
                onPress={() => mutate({ username: initiator.username })}
              >
                {initiator.followers.length === 0 ? "Follow" : "Following"}
              </Button>
            </View>
          }
        />
      )
    }

    default:
      return null
  }
}

function UserAvatarNotification({ user }: { user: RouterOutputs["notification"]["all"][0]["notification"]["initiator"] }) {
  const tab = useTabSegment()

  return (
    <Link push asChild href={`/${tab}/${user.username}/(profile)`}>
      <TouchableOpacity>
        {user.avatar ? (
          <OptimizedImage
            placeholder={user.avatarBlurHash}
            width={80}
            height={80}
            source={{ uri: createAssetUrl(user.avatar) }}
            style={{ height: 40, width: 40 }}
            className="rounded-full bg-gray-100 object-cover dark:bg-gray-700"
          />
        ) : (
          <View
            style={{ height: 40, width: 40 }}
            className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
          >
            <Icon icon={User2} size={20} />
          </View>
        )}
      </TouchableOpacity>
    </Link>
  )
}

function getTimeAgo(date: Date) {
  const nowDiff = dayjs().diff(date, "seconds")
  // if less than 1 minute, then show "5s"
  if (nowDiff < 60) {
    return `${nowDiff}s`
  }
  // if less than 1 hour, then show "5m"
  if (nowDiff < 3600) {
    return `${Math.floor(nowDiff / 60)}m`
  }
  // if less than 1 day, then show "5h"
  if (nowDiff < 86400) {
    return `${Math.floor(nowDiff / 3600)}h`
  }
  // if less than 1 week, then show "5d"
  if (nowDiff < 604800) {
    return `${Math.floor(nowDiff / 86400)}d`
  }
  // else show "5w"
  return `${Math.floor(nowDiff / 604800)}w`
}
