import { TouchableOpacity, View } from "react-native"
import { useRouter } from "expo-router"
import { User2 } from "lucide-react-native"

import { type User } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { useFeedbackActivity } from "./FeedbackCheck"
import { Icon } from "./Icon"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"

interface Props {
  creator: Pick<User, "avatar" | "avatarBlurHash" | "firstName" | "lastName" | "username">
}

export function CreatorCard({ creator }: Props) {
  const router = useRouter()
  const tab = useTabSegment()
  const increment = useFeedbackActivity((s) => s.increment)

  return (
    <TouchableOpacity
      onPress={() => {
        increment()
        router.push(`/${tab}/${creator.username}/(profile)`)
      }}
      className="rounded-xs flex flex-row items-center justify-between border border-gray-200 p-1.5 px-2.5 dark:border-gray-700/70"
    >
      <View>
        <View className="flex flex-row items-center space-x-1">
          <Text>
            Added by{" "}
            <Text className="font-500 ">
              {creator.firstName} {creator.lastName}
            </Text>
          </Text>
        </View>
      </View>

      <View>
        {creator.avatar ? (
          <OptimizedImage
            height={36}
            width={36}
            placeholder={creator.avatarBlurHash}
            source={{ uri: createImageUrl(creator.avatar) }}
            className="sq-9 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
          />
        ) : (
          <View className="sq-10 flex flex-row items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
            <Icon icon={User2} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
