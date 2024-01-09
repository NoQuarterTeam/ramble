import type * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { X } from "lucide-react-native"

import { type SpotType } from "@ramble/database/types"
import { SPOT_TYPE_OPTIONS } from "@ramble/shared"

import { Icon } from "../../../../../../components/Icon"
import { SpotIcon } from "../../../../../../components/SpotIcon"
import { BrandHeading } from "../../../../../../components/ui/BrandHeading"
import { Button } from "../../../../../../components/ui/Button"

interface Props {
  type: SpotType
  setType: React.Dispatch<React.SetStateAction<SpotType>>
  handleClose: () => void
}

export function ReportSpotEditType({ type, setType, handleClose }: Props) {
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
        <View className="flex flex-row flex-wrap gap-2 pt-4">
          {SPOT_TYPE_OPTIONS.filter((s) => !s.isComingSoon).map((spotType) => (
            <Button
              variant={type === spotType.value ? "primary" : "outline"}
              leftIcon={
                <SpotIcon
                  type={spotType.value}
                  size={20}
                  color={{
                    light: type === spotType.value ? "white" : "black",
                    dark: type === spotType.value ? "black" : "white",
                  }}
                />
              }
              key={spotType.value}
              onPress={() => setType(spotType.value)}
            >
              {spotType.label}
            </Button>
          ))}
        </View>
      </ScrollView>
      <Button onPress={handleClose}>Next</Button>
    </View>
  )
}
