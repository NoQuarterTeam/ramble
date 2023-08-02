import { TouchableOpacity } from "react-native"

import { type List } from "@ramble/database/types"

import { useRouter } from "../app/router"
import { Text } from "./ui/Text"

interface Props {
  list: Pick<List, "id" | "name" | "description">
}

export function ListItem({ list }: Props) {
  const { push } = useRouter()
  return (
    <TouchableOpacity
      onPress={() => push("ListDetailScreen", { id: list.id, name: list.name })}
      activeOpacity={0.8}
      className="rounded-lg border border-gray-100 p-4 dark:border-gray-700"
    >
      <Text className="text-xl">{list.name}</Text>
      <Text className="text-base">{list.description}</Text>
    </TouchableOpacity>
  )
}
