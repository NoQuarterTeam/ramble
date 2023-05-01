import { TextInput, type TextInputProps, useColorScheme } from "react-native"
import { styled } from "nativewind"

import { merge } from "@travel/shared"
import colors from "@travel/tailwind-config/src/colors"

export interface InputProps extends TextInputProps {
  className?: string
}

const StyledInput = styled(TextInput)

export function Input(props: TextInputProps) {
  const colorScheme = useColorScheme()
  return (
    <StyledInput
      placeholderTextColor={colorScheme === "dark" ? colors.gray[600] : colors.gray[400]}
      {...props}
      className={merge(
        "border border-gray-100 dark:border-gray-600",
        "font-body text-md focus:border-primary-500 block w-full rounded-md px-3.5 py-2.5 text-black dark:text-white",
        props.className,
      )}
    />
  )
}
