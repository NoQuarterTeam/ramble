import { useRouter } from "expo-router"
import { User2 } from "lucide-react-native"
import { TouchableOpacity, View } from "react-native"

import type { Spot, User } from "@ramble/database/types"
import { createAssetUrl } from "@ramble/shared"

import { useTabSegment } from "~/lib/hooks/useTabSegment"

import dayjs from "dayjs"
import { useFeedbackActivity } from "./FeedbackCheck"
import { Icon } from "./Icon"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"

interface Props {
  spot: Pick<Spot, "createdAt"> & {
    creator: Pick<User, "avatar" | "avatarBlurHash" | "firstName" | "lastName" | "username" | "deletedAt">
  }
}

export function CreatorCard(props: Props) {
  const { creator, createdAt } = props.spot
  const router = useRouter()
  const tab = useTabSegment()
  const increment = useFeedbackActivity((s) => s.increment)

  return (
    <TouchableOpacity
      onPress={() => {
        increment()
        if (creator.deletedAt) return
        router.push(`/${tab}/${creator.username}/(profile)`)
      }}
      activeOpacity={creator.deletedAt ? 1 : 0.7}
      className="flex flex-row items-center justify-between rounded-xs border border-gray-200 p-2 px-3 dark:border-gray-700/70"
    >
      <View className="space-y-0.5">
        <Text>
          Added by{" "}
          <Text className="font-500">
            {creator.firstName} {creator.lastName}
          </Text>
        </Text>
        <Text className="text-xs leading-3 opacity-70">on {dayjs(createdAt).format("DD/MM/YYYY")}</Text>
      </View>

      <View>
        {creator.avatar ? (
          <OptimizedImage
            height={36}
            width={36}
            placeholder={creator.avatarBlurHash}
            source={{ uri: createAssetUrl(creator.avatar) }}
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
