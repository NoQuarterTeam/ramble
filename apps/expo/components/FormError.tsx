import { View, type ViewProps } from "react-native"

import { merge } from "@ramble/shared"

import { Text } from "./Text"
import { ApiError } from "../lib/hooks/useForm"

interface Props extends ViewProps {
  error?: ApiError
}
export function FormError({ error, ...props }: Props) {
  if (!error) return null
  return (
    <View {...props} className={merge("border border-gray-100 p-2 dark:border-gray-700", props.className)}>
      <Text className="text-center text-red-500 dark:text-red-300">
        {typeof error === "string" ? error : error.data?.formError}
      </Text>
    </View>
  )
}
