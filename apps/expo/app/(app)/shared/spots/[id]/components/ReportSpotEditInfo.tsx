import type * as React from "react"
import { ScrollView, Switch, TouchableOpacity, View } from "react-native"
import { Dog, X } from "lucide-react-native"

import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "../../../../../../components/Icon"
import { BrandHeading } from "../../../../../../components/ui/BrandHeading"
import { Button } from "../../../../../../components/ui/Button"
import { FormInputLabel } from "../../../../../../components/ui/FormInput"
import { Input } from "../../../../../../components/ui/Input"
import { Text } from "../../../../../../components/ui/Text"

interface Props {
  name: string
  setName: React.Dispatch<React.SetStateAction<string>>
  description: string
  setDescription: React.Dispatch<React.SetStateAction<string>>
  isPetFriendly: boolean
  setIsPetFriendly: React.Dispatch<React.SetStateAction<boolean>>
  handleClose: () => void
}

export function ReportSpotEditInfo({
  handleClose,
  name,
  setName,
  isPetFriendly,
  setIsPetFriendly,
  description,
  setDescription,
}: Props) {
  return (
    <View className="space-y-6">
      <View className="flex flex-row justify-between pb-2">
        <BrandHeading className="text-3xl">Basic info</BrandHeading>
        <TouchableOpacity onPress={handleClose} className="p-1">
          <Icon icon={X} size={24} />
        </TouchableOpacity>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <FormInputLabel label="Name" />
        <Input value={name} onChangeText={setName} />
        <View className="flex w-full flex-row items-center justify-between py-4">
          <View className="flex flex-row items-center space-x-2">
            <Icon icon={Dog} size={20} />
            <Text className="text-xl">Pet friendly</Text>
          </View>
          <Switch
            trackColor={{ true: colors.primary[600] }}
            value={isPetFriendly}
            onValueChange={() => setIsPetFriendly((p) => !p)}
          />
        </View>
        <FormInputLabel label="Describe the spot" />
        <Input value={description || ""} onChangeText={setDescription} multiline numberOfLines={4} />
      </ScrollView>
      <Button onPress={handleClose}>Next</Button>
    </View>
  )
}
