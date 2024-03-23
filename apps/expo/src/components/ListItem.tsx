import { useRouter } from "expo-router"
import { Lock, User2 } from "lucide-react-native"
import { TouchableOpacity, View } from "react-native"

import type { List, User } from "@ramble/database/types"
import { createAssetUrl } from "@ramble/shared"

import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { Icon } from "./Icon"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"

interface Props {
  list: Pick<List, "id" | "name" | "description" | "isPrivate"> & {
    creator?: Pick<User, "avatar" | "avatarBlurHash" | "firstName" | "lastName">
  }
}

export function ListItem({ list }: Props) {
  const router = useRouter()
  const tab = useTabSegment()
  return (
    <TouchableOpacity
      onPress={() => router.push(`/${tab}/list/${list.id}`)}
      activeOpacity={0.8}
      className="rounded-xs border border-gray-200 p-4 dark:border-gray-700"
    >
      <View className="flex flex-row items-center space-x-2">
        {list.isPrivate && <Icon icon={Lock} size={20} />}
        <Text className="text-xl">{list.name}</Text>
      </View>
      {list.description && <Text className="text-base">{list.description}</Text>}

      {list.creator && (
        <View className="flex flex-row justify-end">
          <View className="flex flex-row items-center space-x-1">
            {list.creator.avatar ? (
              <OptimizedImage
                width={40}
                height={40}
                placeholder={list.creator.avatarBlurHash}
                source={{ uri: createAssetUrl(list.creator.avatar) }}
                className="sq-6 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
              />
            ) : (
              <View className="sq-6 flex items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
                <Icon icon={User2} size={14} />
              </View>
            )}
            <Text className="text-base">{list.creator.firstName}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  )
}
