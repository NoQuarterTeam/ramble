import { View } from "react-native"
import { useLocalSearchParams } from "expo-router"

import { Text } from "../../../components/Text"

export default function ListDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id)
    return (
      <View className="px-4 py-20">
        <Text>List not found</Text>
      </View>
    )
  return (
    <View className="pt-16">
      <Text>List detail</Text>
    </View>
  )
}
