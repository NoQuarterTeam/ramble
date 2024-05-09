import { useLocalSearchParams, useRouter } from "expo-router"
import * as React from "react"
import { ScrollView, Switch, View } from "react-native"

import { AMENITIES } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import type { RambleIcon } from "~/components/ui/Icons"
import { Text } from "~/components/ui/Text"
import { AMENITIES_ICONS } from "~/lib/models/amenities"

import type { AmenityObject } from "~/components/AmenitySelector"
import { NewSpotModalView } from "./NewSpotModalView"

export default function NewSpotAmenitiesScreen() {
  const params = useLocalSearchParams<{ amenities?: string }>()
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

  const router = useRouter()
  return (
    <NewSpotModalView title="what it's got?">
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
            // @ts-ignore
            router.push(`/new/images?${searchParams}`)
          }}
        >
          Next
        </Button>
      </View>
    </NewSpotModalView>
  )
}

function AmenitySelector({
  label,
  isSelected,
  onToggle,
  icon,
}: {
  label: string
  isSelected: boolean
  onToggle: () => void
  icon: RambleIcon | null
}) {
  return (
    <View className="flex w-full flex-row items-center justify-between py-1">
      <View className="flex flex-row items-center space-x-1">
        {icon && <Icon icon={icon} size={20} />}
        <Text className="text-xl">{label}</Text>
      </View>
      <Switch trackColor={{ true: colors.primary[600] }} value={isSelected} onValueChange={onToggle} />
    </View>
  )
}
