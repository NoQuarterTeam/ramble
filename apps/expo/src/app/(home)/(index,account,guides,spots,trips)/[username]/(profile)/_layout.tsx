import { createAssetUrl } from "@ramble/shared"
import { useQuery } from "@tanstack/react-query"
import { Slot, useLocalSearchParams, useRouter, useSegments } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { Heart, Instagram, Languages, User2 } from "lucide-react-native"
import * as React from "react"
import { Linking, ScrollView, TouchableOpacity, View, useColorScheme } from "react-native"
import { Icon } from "~/components/Icon"
import { SignupCta } from "~/components/SignupCta"
import { Button } from "~/components/ui/Button"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"
import { interestOptions } from "~/lib/models/user"
import { type TranslateInput, getTranslation } from "~/lib/translation"

export default function UserScreen() {
  const { me } = useMe()
  const router = useRouter()
  const utils = api.useUtils()
  const colorScheme = useColorScheme()

  const isDark = colorScheme === "dark"

  const params = useLocalSearchParams<{ username: string }>()
  const username = params.username

  const { data: user, isPending: isLoading } = api.user.profile.useQuery({ username }, { staleTime: 30000, enabled: !!username })

  const [isTranslated, setIsTranslated] = React.useState(false) // by default, leave review untranslated, until user actioned

  const { data, isLoading: isLoadingTranslation } = useQuery<TranslateInput, string, string>({
    queryKey: ["bio-translation", { id: user?.id, bio: user?.bio, lang: me?.preferredLanguage || "en" }],
    queryFn: () => getTranslation({ text: user?.bio, lang: me?.preferredLanguage || "en" }),
    staleTime: Number.POSITIVE_INFINITY,
    enabled: isTranslated && !!me?.preferredLanguage && !!user?.bio,
  })

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
      <ScreenView title={username}>
        <SignupCta text="Sign up to view other profiles" />
      </ScreenView>
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
            className="sq-8 flex items-center justify-center rounded-full bg-background dark:bg-gray-800"
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
                  source={{ uri: createAssetUrl(user.avatar) }}
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
                <View className="flex flex-row items-center space-x-0.5">
                  {interestOptions
                    .filter((i) => user[i.value as keyof typeof user])
                    .map((interest) => (
                      <View
                        key={interest.value}
                        className="rounded-xs border border-gray-100 sq-7 flex items-center justify-center dark:border-gray-700"
                      >
                        <Icon icon={interest.Icon} size={16} />
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
                <Icon icon={Instagram} size={16} />
                <Text>{user.instagram}</Text>
              </TouchableOpacity>
            )}
            <View className="space-y-0.5">
              <Text>{isTranslated && data ? data : user.bio}</Text>
              {me.preferredLanguage !== user.bioLanguage && (
                <Button
                  leftIcon={<Icon icon={Languages} size={14} />}
                  onPress={() => setIsTranslated((t) => !t)}
                  variant="link"
                  isLoading={isLoadingTranslation}
                  size="xs"
                  className="px-0 h-6 justify-start"
                >
                  {isTranslated ? "See original" : "Translate"}
                </Button>
              )}

              <View className="flex flex-row flex-wrap gap-1">
                {user.tags?.map((tag) => (
                  <View key={tag.id} className="border border-gray-200 dark:border-gray-700 px-2 py-1">
                    <Text className="text-xs opacity-80">{tag.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="flex flex-row items-center justify-center space-x-2 border-gray-100 border-b bg-background py-2 dark:border-gray-800 dark:bg-background-dark">
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
