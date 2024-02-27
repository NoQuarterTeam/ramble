import { AlertTriangle } from "lucide-react-native"
import { View, type ViewProps } from "react-native"

import { merge } from "@ramble/shared"

import { type ApiError } from "~/lib/hooks/useForm"

import { Icon } from "../Icon"
import { Text } from "./Text"

interface Props extends ViewProps {
  error?: ApiError
}
export function FormError({ error, ...props }: Props) {
  if (!error || !error.data?.formError) return null
  return (
    <View className="items-center justify-center">
      <View
        {...props}
        className={merge(
          "flex flex-row items-center justify-center space-x-1 rounded-sm border border-red-600 bg-red-500 p-1.5 px-4 dark:border-red-700 dark:bg-red-800",
          props.className,
        )}
      >
        <Icon icon={AlertTriangle} color="white" size={16} />
        <Text className="font-600 text-center text-sm text-white">
          {typeof error === "string" ? error : error.data?.formError}
        </Text>
      </View>
    </View>
  )
}
