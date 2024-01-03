import type * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { X } from "lucide-react-native"

import { AMENITIES } from "@ramble/shared"

import { type AmenityObject, AmenitySelector } from "../../../../../../components/AmenitySelector"
import { Icon } from "../../../../../../components/Icon"
import { BrandHeading } from "../../../../../../components/ui/BrandHeading"
import { Button } from "../../../../../../components/ui/Button"
import { AMENITIES_ICONS } from "../../../../../../lib/models/amenities"

interface Props {
  amenities: AmenityObject
  setAmenities: React.Dispatch<React.SetStateAction<AmenityObject>>
  handleClose: () => void
}

export function ReportSpotEditAmenities({ amenities, setAmenities, handleClose }: Props) {
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
        {Object.entries(AMENITIES).map(([key, label]) => (
          <AmenitySelector
            key={key}
            label={label}
            icon={AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]}
            isSelected={!!amenities[key as keyof typeof AMENITIES]}
            onToggle={() => setAmenities((a) => ({ ...a, [key]: !a[key as keyof typeof AMENITIES] }))}
          />
        ))}
      </ScrollView>
      <Button onPress={handleClose}>Next</Button>
    </View>
  )
}
