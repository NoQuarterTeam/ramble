import { TouchableOpacity, View } from "react-native"
import { User2 } from "lucide-react-native"

import { type User } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { Text } from "~/components/ui/Text"
import { useRouter } from "expo-router"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

interface Props {
  user: Pick<User, "avatar" | "username" | "firstName" | "lastName" | "avatarBlurHash">
}

export function UserItem(props: Props) {
  const router = useRouter()
  const tab = useTabSegment()
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="flex flex-row items-center space-x-2"
      onPress={() => router.push(`/${tab}/${props.user.username}/(profile)`)}
    >
      {props.user.avatar ? (
        <OptimizedImage
          height={60}
          width={60}
          placeholder={props.user.avatarBlurHash}
          source={{ uri: createImageUrl(props.user.avatar) }}
          className="sq-14 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
        />
      ) : (
        <View className="sq-14 flex items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
          <Icon icon={User2} />
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
