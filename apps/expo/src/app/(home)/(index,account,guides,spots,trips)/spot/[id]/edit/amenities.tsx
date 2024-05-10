import { useLocalSearchParams, useRouter } from "expo-router"
import * as React from "react"
import { ScrollView, View } from "react-native"

import { AMENITIES } from "@ramble/shared"

import { type AmenityObject, AmenitySelector } from "~/components/AmenitySelector"
import { Button } from "~/components/ui/Button"
import { useTabSegment } from "~/lib/hooks/useTabSegment"
import { AMENITIES_ICONS } from "~/lib/models/amenities"

import { EditSpotModalView } from "./EditSpotModalView"

export default function EditSpotAmenitiesScreen() {
  const { id, ...params } = useLocalSearchParams<{ id: string; amenities: string }>()
  const [amenities, setAmenities] = React.useState(
    params.amenities
      ? Object.entries(JSON.parse(params.amenities)).reduce((acc, [key, value]) => {
          acc[key as keyof typeof AMENITIES] = value as boolean
          return acc
        }, {} as AmenityObject)
      : Object.keys(AMENITIES).reduce((acc, key) => {
          acc[key as keyof typeof AMENITIES] = false
          return acc
        }, {} as AmenityObject),
  )
  const tab = useTabSegment()
  const router = useRouter()
  return (
    <EditSpotModalView title="what it's got?">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
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

      <View className="absolute right-4 bottom-12 left-4 flex items-center justify-center space-y-2">
        <Button
          className="rounded-full"
          onPress={() => {
            const searchParams = new URLSearchParams({ ...params, amenities: amenities ? JSON.stringify(amenities) : "" })
            router.push(`/${tab}/spot/${id}/edit/images?${searchParams}`)
          }}
        >
          Next
        </Button>
      </View>
    </EditSpotModalView>
  )
}
