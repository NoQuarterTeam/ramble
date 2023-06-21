import { Controller, useFormContext } from "react-hook-form"
import { View } from "react-native"

import { merge } from "@ramble/shared"

import { Input, type InputProps } from "./Input"
import { Text } from "./Text"

interface Props extends InputProps {
  label?: string
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: string | null | { data?: null | { zodError?: { fieldErrors: any } | null; formError?: string | null } }
  rightElement?: React.ReactNode
}

export function FormInput({ label, name, error, rightElement, ...props }: Props) {
  const { control } = useFormContext()

  return (
    <View className="mb-2 space-y-0.5">
      {label && <FormInputLabel label={label} />}
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, onBlur } }) => (
          <View className="flex flex-row items-center space-x-2">
            <Input
              {...props}
              onChangeText={onChange}
              value={value}
              onBlur={onBlur}
              className={merge(rightElement && "flex-1", props.className)}
            />
            <View>{rightElement}</View>
          </View>
        )}
      />
      {typeof error === "string"
        ? error
        : error?.data?.zodError?.fieldErrors[name]?.map((error: string) => <FormInputError key={error} error={error} />)}
    </View>
  )
}

export function FormInputLabel({ label }: { label: string }) {
  return <Text className="font-400">{label}</Text>
}

export function FormInputError({ error }: { error: string }) {
  return <Text className="text-red-500">{error}</Text>
}
