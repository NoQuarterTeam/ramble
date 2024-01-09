import * as React from "react"
import { ScrollView, View } from "react-native"

import { AMENITIES } from "@ramble/shared"

import { type AmenityObject, AmenitySelector } from "../../../../../../components/AmenitySelector"
import { Button } from "../../../../../../components/ui/Button"
import { AMENITIES_ICONS } from "../../../../../../lib/models/amenities"
import { useParams, useRouter } from "../../../../../router"
import { EditSpotModalView } from "./EditSpotModalView"

export function EditSpotAmenitiesScreen() {
  const { params } = useParams<"EditSpotAmenitiesScreen">()
  const [amenities, setAmenities] = React.useState(
    params.amenities
      ? Object.entries(params.amenities).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as AmenityObject)
      : Object.keys(AMENITIES).reduce((acc, key) => ({ ...acc, [key]: false }), {} as AmenityObject),
  )

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

      <View className="absolute bottom-12 left-4 right-4 flex items-center justify-center space-y-2">
        <Button className="rounded-full" onPress={() => router.push("EditSpotImagesScreen", { ...params, amenities })}>
          Next
        </Button>
      </View>
    </EditSpotModalView>
  )
}
