import { TextInput, type TextInputProps, useColorScheme } from "react-native"

import { merge } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

export interface InputProps extends TextInputProps {
  className?: string
}

export function Input(props: InputProps) {
  const colorScheme = useColorScheme()
  return (
    <TextInput
      placeholderTextColor={colorScheme === "dark" ? colors.gray[500] : colors.gray[400]}
      {...props}
      className={merge(
        "border border-gray-200 dark:border-gray-600",
        "text-md focus:border-primary-500 rounded-xs block w-full px-3.5 py-2.5 text-black dark:text-white",
        props.className,
      )}
    />
  )
}
