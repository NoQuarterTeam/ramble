import { TouchableOpacity, View } from "react-native"

import { type List } from "@ramble/database/types"

import { useRouter } from "../app/router"
import { Text } from "./ui/Text"
import { Lock } from "lucide-react-native"

interface Props {
  list: Pick<List, "id" | "name" | "description" | "isPrivate">
}

export function ListItem({ list }: Props) {
  const { push } = useRouter()
  return (
    <TouchableOpacity
      onPress={() => push("ListDetailScreen", { id: list.id, name: list.name })}
      activeOpacity={0.8}
      className="rounded-lg border border-gray-100 p-4 dark:border-gray-700"
    >
      <View className="flex flex-row items-center space-x-2">
        {list.isPrivate && <Lock className="text-black dark:text-white" size={20} />}
        <Text className="text-xl">{list.name}</Text>
      </View>
      <Text className="text-base">{list.description}</Text>
    </TouchableOpacity>
  )
}
