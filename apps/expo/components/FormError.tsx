import { View, ViewProps } from "react-native"

import { Text } from "./Text"
import { merge } from "@ramble/shared"

export function FormError({ error, ...props }: ViewProps & { error: string }) {
  return (
    <View {...props} className={merge("border border-gray-100 p-2 dark:border-gray-700", props.className)}>
      <Text className="text-center text-red-500 dark:text-red-300">{error}</Text>
    </View>
  )
}
