import { ScrollView, TouchableOpacity, View } from "react-native"
import { ChevronLeft } from "lucide-react-native"

import { Button } from "../../../../components/ui/Button"
import { Heading } from "../../../../components/ui/Heading"
import { UserProfile } from "../../../../components/UserProfile"
import { useParams, useRouter } from "../../../router"
import UsernameLists from "./lists"
import { UsernameSpots } from "./spots"
import { UsernameVan } from "./van"

export function UsernameLayout() {
  // const { me } = useMe()
  const { params } = useParams<"UsernameLayout">()

  const tab = params.tab || "spots"
  const router = useRouter()

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
      </View>
      <ScrollView className="min-h-full" stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        <View className="px-4 py-2">
          <UserProfile username={params.username} />
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
        <View className="p-2">
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
