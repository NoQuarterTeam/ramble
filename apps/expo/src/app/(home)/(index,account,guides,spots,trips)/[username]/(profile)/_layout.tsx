import * as React from "react"
import { Linking, ScrollView, TouchableOpacity, useColorScheme, View } from "react-native"
import { Slot, useLocalSearchParams, useRouter, useSegments } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ChevronLeft, Heart, Instagram, User2 } from "lucide-react-native"

import { createImageUrl } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { LoginPlaceholder } from "~/components/LoginPlaceholder"
import { SafeAreaView } from "~/components/SafeAreaView"
import { BrandHeading } from "~/components/ui/BrandHeading"
import { Button } from "~/components/ui/Button"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"
import { interestOptions } from "~/lib/models/user"

export default function UserScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const { me } = useMe()
  const params = useLocalSearchParams<{ username: string }>()
  const username = params.username

  const { data: user, isLoading } = api.user.profile.useQuery({ username }, { cacheTime: 30000, enabled: !!username })

  const router = useRouter()
  const utils = api.useUtils()
  const { mutate } = api.user.toggleFollow.useMutation({
    onSuccess: () => {
      if (!me) return
      void utils.user.followers.refetch({ username })
      void utils.user.profile.refetch({ username })
      void utils.user.following.refetch({ username: me.username })
      void utils.user.profile.refetch({ username: me.username })
    },
  })

  const [isFollowedByMe, setIsFollowedByMe] = React.useState(!!user?.isFollowedByMe)

  React.useEffect(() => {
    if (!user) return
    setIsFollowedByMe(user.isFollowedByMe)
  }, [user, user?.isFollowedByMe])

  const onToggleFollow = () => {
    setIsFollowedByMe(!isFollowedByMe)
    mutate(params)
  }

  const tab = useTabSegment()
  const segments = useSegments()

  if (!me)
    return (
      <SafeAreaView>
        <View className="p-4">
          <View className="flex flex-row items-center">
            {router.canGoBack() && (
              <TouchableOpacity className="sq-8 flex items-center justify-center" onPress={router.back} activeOpacity={0.8}>
                <ChevronLeft className="text-primary mt-2" />
              </TouchableOpacity>
            )}
            <View>
              <BrandHeading style={{ paddingLeft: 6 }} className="text-3xl">
                {username}
              </BrandHeading>
            </View>
          </View>
          <LoginPlaceholder text="log in to view other profiles"></LoginPlaceholder>
        </View>
      </SafeAreaView>
    )

  return (
    <ScreenView
      title={username}
      rightElement={
        user &&
        me &&
        me.username !== username && (
          <TouchableOpacity
            onPress={onToggleFollow}
            activeOpacity={0.8}
            className="sq-8 bg-background flex items-center justify-center rounded-full dark:bg-gray-800"
          >
            <Icon icon={Heart} size={20} fill={isFollowedByMe ? (isDark ? "white" : "black") : "transparent"} />
          </TouchableOpacity>
        )
      }
    >
      {isLoading ? (
        <View className="flex items-center justify-center p-4">
          <Spinner />
        </View>
      ) : !user ? (
        <View className="p-4">
          <Text>User not found</Text>
        </View>
      ) : (
        <ScrollView className="min-h-full" stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
          <View className="space-y-2 py-2">
            <View className="flex flex-row items-center space-x-3">
              {user.avatar ? (
                <OptimizedImage
                  width={100}
                  placeholder={user.avatarBlurHash}
                  height={100}
                  source={{ uri: createImageUrl(user.avatar) }}
                  style={{ height: 100, width: 100 }}
                  className="rounded-full bg-gray-100 object-cover dark:bg-gray-700"
                />
              ) : (
                <View
                  style={{ height: 100, width: 100 }}
                  className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
                >
                  <Icon icon={User2} />
                </View>
              )}
              <View className="space-y-px">
                <Text className="text-xl">
                  {user.firstName} {user.lastName}
                </Text>

                <View className="flex flex-row items-center space-x-4">
                  <TouchableOpacity
                    onPressIn={() => {
                      void utils.user.following.prefetch({ username })
                    }}
                    className="flex flex-row space-x-1 pb-2"
                    onPress={() => router.push(`/${tab}/${username}/following`)}
                  >
                    <Text className="font-600">{user._count.following}</Text>
                    <Text className="opacity-70">following</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPressIn={() => {
                      void utils.user.followers.prefetch({ username })
                    }}
                    className="flex flex-row space-x-1 pb-2"
                    onPress={() => router.push(`/${tab}/${username}/followers`)}
                  >
                    <Text className="font-600">{user._count.followers}</Text>
                    <Text className="opacity-70">followers</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex flex-row items-center space-x-1">
                  {interestOptions
                    .filter((i) => user[i.value as keyof typeof user])
                    .map((interest) => (
                      <View key={interest.value} className="rounded-xs border border-gray-100 p-1.5 dark:border-gray-700">
                        <Icon icon={interest.Icon} size={18} />
                      </View>
                    ))}
                </View>
              </View>
            </View>
            {user.instagram && (
              <TouchableOpacity
                activeOpacity={0.8}
                className="flex flex-row items-center space-x-1"
                onPress={() => Linking.openURL(`https://www.instagram.com/${user.instagram}`)}
              >
                <Icon icon={Instagram} />
                <Text>{user.instagram}</Text>
              </TouchableOpacity>
            )}
            <Text>{user.bio}</Text>
          </View>

          <View className="bg-background dark:bg-background-dark flex flex-row items-center justify-center space-x-2 border-b border-gray-100 py-2 dark:border-gray-800">
            <Button
              variant={segments[segments.length - 1] === "(profile)" ? "secondary" : "ghost"}
              size="sm"
              onPress={() => router.navigate({ pathname: `/${tab}/[username]/(profile)`, params: { username } })}
            >
              Spots
            </Button>

            <Button
              variant={segments[segments.length - 1] === "van" ? "secondary" : "ghost"}
              size="sm"
              onPress={() => router.navigate({ pathname: `/${tab}/[username]/(profile)/van`, params: { username } })}
            >
              Van
            </Button>

            <Button
              variant={segments[segments.length - 1] === "lists" ? "secondary" : "ghost"}
              size="sm"
              onPress={() => router.navigate({ pathname: `/${tab}/[username]/(profile)/lists`, params: { username } })}
            >
              Lists
            </Button>
          </View>
          <View className="flex-1 py-2 pb-20">
            <Slot />
          </View>
        </ScrollView>
      )}
      <StatusBar style="auto" />
    </ScreenView>
  )
}
