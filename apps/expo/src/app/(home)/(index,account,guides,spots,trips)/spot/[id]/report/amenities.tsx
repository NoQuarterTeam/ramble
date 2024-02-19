import * as React from "react"
import { ScrollView } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"

import { AMENITIES } from "@ramble/shared"

import { type AmenityObject, AmenitySelector } from "~/components/AmenitySelector"
import { Button } from "~/components/ui/Button"
import { useTabSegment } from "~/lib/hooks/useTabSegment"
import { AMENITIES_ICONS } from "~/lib/models/amenities"

import { ReportSpotModalView } from "./ReportSpotModalView"

export default function SpotReportAmenitiesScreen() {
  const { id, ...params } = useLocalSearchParams<{ id: string; amenities: string }>()
  const [amenities, setAmenities] = React.useState(
    params.amenities
      ? Object.entries(JSON.parse(params.amenities)).reduce(
          (acc, [key, value]) => ({ ...acc, [key]: value }),
          {} as AmenityObject,
        )
      : Object.keys(AMENITIES).reduce((acc, key) => ({ ...acc, [key]: false }), {} as AmenityObject),
  )

  const router = useRouter()

  const tab = useTabSegment()
  const handleClose = () => {
    router.navigate(`/${tab}/spot/${id}/report?${new URLSearchParams({ ...params, amenities: JSON.stringify(amenities) })}`)
  }

  return (
    <ReportSpotModalView title="amenities">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="space-y-2"
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
        <Button onPress={handleClose}>Done</Button>
      </ScrollView>
    </ReportSpotModalView>
  )
}
