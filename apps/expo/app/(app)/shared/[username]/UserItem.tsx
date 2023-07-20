import { TouchableOpacity, View } from "react-native"
import { User2 } from "lucide-react-native"

import { type User } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { Text } from "../../../../components/ui/Text"
import { useRouter } from "../../../router"
import { OptimizedImage } from "../../../../components/ui/OptimisedImage"

interface Props {
  user: Pick<User, "avatar" | "username" | "firstName" | "lastName">
}

export function UserItem(props: Props) {
  const router = useRouter()
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="flex flex-row items-center space-x-2"
      onPress={() => router.push("UserScreen", { username: props.user.username })}
    >
      {props.user.avatar ? (
        <OptimizedImage
          height={60}
          width={60}
          source={{ uri: createImageUrl(props.user.avatar) }}
          className="sq-14 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
        />
      ) : (
        <View className="sq-14 flex items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
          <User2 className="text-black dark:text-white" />
        </View>
      )}
      <View>
        <Text className="font-600">{props.user.username}</Text>
        <Text>
          {props.user.firstName} {props.user.lastName}
        </Text>
      </View>
    </TouchableOpacity>
  )
}
