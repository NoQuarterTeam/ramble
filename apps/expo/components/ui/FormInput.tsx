import { Controller, useFormContext } from "react-hook-form"
import { Switch, View } from "react-native"

import { merge } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { type ApiError } from "../../lib/hooks/useForm"
import { Input, type InputProps } from "./Input"
import { Text } from "./Text"

interface Props extends InputProps {
  label?: string
  name: string
  error?: ApiError
  rightElement?: React.ReactNode
}

export function FormInput({ label, name, error, rightElement, ...props }: Props) {
  const { control } = useFormContext()

  return (
    <View className="mb-2 space-y-0.5">
      {label && <FormInputLabel label={label} name={name} />}
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, onBlur } }) => (
          <View className="flex flex-row items-center space-x-2">
            <Input
              {...props}
              accessibilityLabel="input"
              accessibilityLabelledBy={name}
              onChangeText={onChange}
              value={value}
              textAlignVertical="top"
              onBlur={onBlur}
              className={merge(rightElement && "flex-1", props.className)}
            />
            <View>{rightElement}</View>
          </View>
        )}
      />
      {typeof error === "string"
        ? error
        : error?.data?.zodError?.fieldErrors[name]?.map((error) => <FormInputError key={error} error={error} />)}
    </View>
  )
}
export function FormSwitchInput({ label, name, error }: Props) {
  const { control } = useFormContext()

  return (
    <View className="mb-2 space-y-0.5">
      {label && <FormInputLabel label={label} name={name} />}
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Switch trackColor={{ true: colors.primary[600] }} value={value} onValueChange={onChange} />
        )}
      />
      {typeof error === "string"
        ? error
        : error?.data?.zodError?.fieldErrors[name]?.map((error) => <FormInputError key={error} error={error} />)}
    </View>
  )
}

export function FormInputLabel({ label, name }: { label: string; name?: string }) {
  return (
    <Text nativeID={name} className="font-400">
      {label}
    </Text>
  )
}

export function FormInputError({ error }: { error: string }) {
  return <Text className="text-red-500">{error}</Text>
}
