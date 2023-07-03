import { ScrollView, TouchableOpacity, View, useColorScheme } from "react-native"
import { ChevronLeft, Heart, User2 } from "lucide-react-native"

import { Button } from "../../../../components/ui/Button"
import { Heading } from "../../../../components/ui/Heading"

import { useParams, useRouter } from "../../../router"
import UsernameLists from "./lists"
import { UsernameSpots } from "./spots"
import { UsernameVan } from "./van"
import { useMe } from "../../../../lib/hooks/useMe"
import { api } from "../../../../lib/api"
import { Image } from "expo-image"
import { createImageUrl } from "@ramble/shared"
import { Spinner } from "../../../../components/ui/Spinner"
import { Text } from "../../../../components/ui/Text"
import { interestOptions } from "../../../../lib/interests"

export function UsernameLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const { me } = useMe()
  const { params } = useParams<"UsernameLayout">()
  const { data: user, isLoading } = api.user.profile.useQuery({ username: params.username })
  const tab = params.tab || "spots"
  const router = useRouter()
  const utils = api.useContext()
  const { mutate } = api.user.toggleFollow.useMutation({
    onSuccess: () => {
      void utils.user.profile.refetch({ username: params.username })
    },
  })
  const onToggleFollow = () => mutate({ username: params.username })

  if (isLoading)
    return (
      <View className="flex items-center justify-center py-20">
        <Spinner />
      </View>
    )
  if (!user)
    return (
      <View className="px-4 py-20">
        <Text>User not found</Text>
      </View>
    )
  return (
    <View className="pt-16">
      <View className="flex flex-row items-center justify-between px-6 pb-2">
        <View className="flex flex-row items-center space-x-2">
          {router.canGoBack() && (
            <TouchableOpacity onPress={router.goBack} activeOpacity={0.8}>
              <ChevronLeft className="text-black dark:text-white" />
            </TouchableOpacity>
          )}
          <Heading className="font-700 text-2xl">{params.username}</Heading>
        </View>
        {me && me?.username !== params.username && (
          <TouchableOpacity
            onPress={onToggleFollow}
            activeOpacity={0.8}
            className="sq-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800"
          >
            <Heart
              size={20}
              className="text-black dark:text-white"
              fill={user.followedBy && user.followedBy.length > 0 ? (isDark ? "white" : "black") : undefined}
            />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView className="min-h-full" stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        <View className="px-4 py-2">
          <View>
            <View className="flex flex-row items-center space-x-3">
              {user.avatar ? (
                <Image
                  source={{ uri: createImageUrl(user.avatar) }}
                  className="sq-20 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
                />
              ) : (
                <View className="sq-20 flex items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
                  <User2 className="text-black dark:text-white" />
                </View>
              )}
              <View className="space-y-px">
                <Text className="text-xl">
                  {user.firstName} {user.lastName}
                </Text>

                <View className="flex flex-row items-center space-x-2">
                  {interestOptions
                    .filter((i) => user[i.value as keyof typeof user])
                    .map((interest) => (
                      <View key={interest.value} className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                        <interest.Icon size={20} className="text-black dark:text-white" />
                      </View>
                    ))}
                </View>
              </View>
            </View>
            <Text>{user.bio}</Text>
          </View>
        </View>

        <View className="flex flex-row items-center justify-center space-x-2 border-b border-gray-100 bg-white py-2 dark:border-gray-800 dark:bg-black">
          <View>
            <Button
              onPress={() => router.navigate("UsernameLayout", { tab: "spots", username: params.username })}
              variant={tab === "spots" ? "secondary" : "ghost"}
              size="sm"
            >
              Spots
            </Button>
          </View>
          <View>
            <Button
              variant={tab === "van" ? "secondary" : "ghost"}
              onPress={() => router.navigate("UsernameLayout", { tab: "van", username: params.username })}
              size="sm"
            >
              Van
            </Button>
          </View>
          <View>
            <Button
              variant={tab === "lists" ? "secondary" : "ghost"}
              onPress={() => router.navigate("UsernameLayout", { tab: "lists", username: params.username })}
              size="sm"
            >
              Lists
            </Button>
          </View>
        </View>
        <View className="p-2 pb-20">
          <UsernameTabs />
        </View>
      </ScrollView>
    </View>
  )
}

function UsernameTabs() {
  const { params } = useParams<"UsernameLayout">()
  switch (params.tab) {
    case "van":
      return <UsernameVan />
    case "lists":
      return <UsernameLists />
    case "spots":
      return <UsernameSpots />
    default:
      return <UsernameSpots />
  }
}
