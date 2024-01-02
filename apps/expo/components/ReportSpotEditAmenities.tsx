import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { Button } from "./ui/Button"
import { AmenityObject, AmenitySelector } from "../app/(app)/shared/spots/[id]/edit/amenities"
import { AMENITIES } from "@ramble/shared"
import { AMENITIES_ICONS } from "../lib/models/amenities"
import { BrandHeading } from "./ui/BrandHeading"
import { Icon } from "./Icon"
import { X } from "lucide-react-native"

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
