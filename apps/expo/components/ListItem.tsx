import { TouchableOpacity, View } from "react-native"
import { Lock, User2 } from "lucide-react-native"

import { type List, type User } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { useRouter } from "../app/router"
import { Icon } from "./Icon"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"

interface Props {
  list: Pick<List, "id" | "name" | "description" | "isPrivate"> & {
    creator?: Pick<User, "avatar" | "avatarBlurHash" | "firstName" | "lastName">
  }
}

export function ListItem({ list }: Props) {
  const { push } = useRouter()
  return (
    <TouchableOpacity
      onPress={() => push("ListDetailScreen", { id: list.id, name: list.name })}
      activeOpacity={0.8}
      className="rounded-xs border border-gray-100 p-4 dark:border-gray-700"
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
                source={{ uri: createImageUrl(list.creator.avatar) }}
                className="sq-6 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
              />
            ) : (
              <View className="sq-24 flex items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
                <Icon icon={User2} />
              </View>
            )}
            <Text className="text-base">{list.creator.firstName}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  )
}
