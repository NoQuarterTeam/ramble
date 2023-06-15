import { List } from "@ramble/database/types"

import { TouchableOpacity } from "react-native"
import { Text } from "./Text"
import { useRouter } from "../app/router"

interface Props {
  list: Pick<List, "id" | "name" | "description">
}

export function ListItem({ list }: Props) {
  const { push } = useRouter()
  return (
    <TouchableOpacity
      onPress={() => push("ListDetailScreen", { id: list.id })}
      activeOpacity={0.8}
      className="rounded-lg border border-gray-100 p-4 dark:border-gray-700"
    >
      <Text className="text-xl">{list.name}</Text>
      <Text className="text-base">{list.description}</Text>
    </TouchableOpacity>
  )
}
