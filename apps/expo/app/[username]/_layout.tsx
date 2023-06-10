import { Slot, useLocalSearchParams, useNavigation, useRouter, useSegments } from "expo-router"
import { ChevronLeft } from "lucide-react-native"

import { ScrollView, TouchableOpacity, View } from "react-native"
import { Heading } from "../../components/Heading"
import { Text } from "../../components/Text"
import { UserProfile } from "../../components/UserProfile"
import { Button } from "../../components/Button"

export default function UsernameLayout() {
  // const { me } = useMe()
  const { username } = useLocalSearchParams<{ username: string }>()
  const navigation = useNavigation()

  const router = useRouter()
  const segments = useSegments()
  // const isPublicProfileTab = segments.find((s) => s === "[username]")
  console.log(segments)

  if (!username)
    return (
      <View className="px-4 py-20">
        <Text>User not found</Text>
      </View>
    )

  return (
    <View className="pt-16">
      <View className="flex flex-row items-center justify-between px-6 pb-2">
        <View className="flex flex-row items-center space-x-2">
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={navigation.goBack} activeOpacity={0.8}>
              <ChevronLeft className="text-black dark:text-white" />
            </TouchableOpacity>
          )}
          <Heading className="font-700 text-2xl">{username}</Heading>
        </View>
      </View>
      <ScrollView className="min-h-full" stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        <View className="px-4 py-2">
          <UserProfile username={username} />
        </View>

        <View className="flex flex-row items-center justify-center space-x-2 border-b border-gray-100 bg-white py-2 dark:border-gray-800 dark:bg-black">
          <View>
            <Button
              onPress={() => router.push({ pathname: `/[username]`, params: { username } })}
              variant={segments.find((s) => s === "[username]") && segments.length === 1 ? "secondary" : "ghost"}
              size="sm"
            >
              Spots
            </Button>
          </View>
          <View>
            <Button
              onPress={() => router.push({ pathname: `/[username]/van`, params: { username } })}
              variant={segments.find((s) => s === "van") ? "secondary" : "ghost"}
              size="sm"
            >
              Van
            </Button>
          </View>
          <View>
            <Button
              variant={segments.find((s) => s === "lists") ? "secondary" : "ghost"}
              size="sm"
              onPress={() => router.push({ pathname: `/[username]/lists`, params: { username } })}
            >
              Lists
            </Button>
          </View>
        </View>
        <View className="p-2">
          <Slot />
        </View>
      </ScrollView>
    </View>
  )
}
