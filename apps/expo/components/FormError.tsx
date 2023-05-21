import { View } from "react-native"

import { Text } from "./Text"

export function FormError({ error }: { error: string }) {
  return (
    <View className="border border-gray-100 p-2 dark:border-gray-700">
      <Text className="text-center text-red-500 dark:text-red-300">{error}</Text>
    </View>
  )
}
