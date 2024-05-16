import { createAssetUrl } from "@ramble/shared"
import { Link } from "expo-router"
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

export default function AccountNotificationsScreen() {
  const { data, isLoading } = api.notification.all.useQuery()

  const utils = api.useUtils()
  const { mutate } = api.notification.markSeed.useMutation({
    onSuccess: () => {
      utils.notification.unreadCount.refetch()
    },
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: allow
  React.useEffect(() => {
    ;(async () => {
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
          data?.map((userNotification) => <UserNotification key={userNotification.id} userNotification={userNotification} />)
        )}
      </ScrollView>
    </ScreenView>
  )
}

function UserNotification({ userNotification }: { userNotification: RouterOutputs["notification"]["all"][0] }) {
  return (
    <View className="p-2">
      <NotificationType userNotification={userNotification} />
    </View>
  )
}

function NotificationType({ userNotification }: { userNotification: RouterOutputs["notification"]["all"][0] }) {
  const initiator = userNotification.notification.initiator
  switch (userNotification.notification.type) {
    case "TRIP_MEDIA_ADDED":
      return (
        <Link push asChild href={`/(home)/(account)/trip/${userNotification.notification.trip?.id}`}>
          <TouchableOpacity className="flex flex-row items-center space-x-4">
            {initiator.avatar ? (
              <OptimizedImage
                width={80}
                placeholder={initiator.avatarBlurHash}
                height={80}
                source={{ uri: createAssetUrl(initiator.avatar) }}
                style={{ height: 40, width: 40 }}
                className="rounded-full bg-gray-100 object-cover dark:bg-gray-700"
              />
            ) : (
              <View
                style={{ height: 40, width: 40 }}
                className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
              >
                <Icon icon={User2} />
              </View>
            )}
            <Text className="text-sm">
              <Text className="font-600">{initiator.username}</Text> added some images and videos to{" "}
              <Text className="font-600">{userNotification.notification.trip?.name}</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      )
    case "TRIP_SPOT_ADDED":
      return (
        <Link push asChild href={`/(home)/(account)/trip/${userNotification.notification.trip?.id}`}>
          <TouchableOpacity className="flex flex-row items-center space-x-4">
            {initiator.avatar ? (
              <OptimizedImage
                width={80}
                placeholder={initiator.avatarBlurHash}
                height={80}
                source={{ uri: createAssetUrl(initiator.avatar) }}
                style={{ height: 40, width: 40 }}
                className="rounded-full bg-gray-100 object-cover dark:bg-gray-700"
              />
            ) : (
              <View
                style={{ height: 40, width: 40 }}
                className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
              >
                <Icon icon={User2} />
              </View>
            )}
            <Text className="text-sm">
              <Text className="font-600">{initiator.username}</Text> added a new spot to{" "}
              <Text className="font-600">{userNotification.notification.trip?.name}</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      )
    case "TRIP_STOP_ADDED":
      return (
        <Link push asChild href={`/(home)/(account)/trip/${userNotification.notification.trip?.id}`}>
          <TouchableOpacity className="flex flex-row items-center space-x-4">
            {initiator.avatar ? (
              <OptimizedImage
                width={80}
                placeholder={initiator.avatarBlurHash}
                height={80}
                source={{ uri: createAssetUrl(initiator.avatar) }}
                style={{ height: 40, width: 40 }}
                className="rounded-full bg-gray-100 object-cover dark:bg-gray-700"
              />
            ) : (
              <View
                style={{ height: 40, width: 40 }}
                className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
              >
                <Icon icon={User2} />
              </View>
            )}
            <Text className="text-sm">
              <Text className="font-600">{initiator.username}</Text> added a new stop to{" "}
              <Text className="font-600">{userNotification.notification.trip?.name}</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      )
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
        <Link push asChild href={`/(home)/(account)/${userNotification.notification.initiator.username}/(profile)`}>
          <TouchableOpacity className="flex flex-row items-center justify-between space-x-2">
            <View className="flex flex-row items-center space-x-4">
              {initiator.avatar ? (
                <OptimizedImage
                  width={80}
                  placeholder={initiator.avatarBlurHash}
                  height={80}
                  source={{ uri: createAssetUrl(initiator.avatar) }}
                  style={{ height: 40, width: 40 }}
                  className="rounded-full bg-gray-100 object-cover dark:bg-gray-700"
                />
              ) : (
                <View
                  style={{ height: 40, width: 40 }}
                  className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
                >
                  <Icon icon={User2} />
                </View>
              )}
              <Text className="text-sm">
                <Text className="font-600">{initiator.username}</Text> started following you
              </Text>
            </View>
            <Button
              size="sm"
              className="h-8"
              variant={initiator.followers.length === 0 ? "primary" : "secondary"}
              onPress={() => mutate({ username: initiator.username })}
            >
              {initiator.followers.length === 0 ? "Follow" : "Following"}
            </Button>
          </TouchableOpacity>
        </Link>
      )
    }

    default:
      return null
  }
}
