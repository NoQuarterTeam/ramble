import { useLocalSearchParams, useRouter } from "expo-router"
import * as React from "react"
import { ScrollView, Switch, View } from "react-native"

import { AMENITIES } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { type RambleIcon } from "~/components/ui/Icons"
import { Text } from "~/components/ui/Text"
import { AMENITIES_ICONS } from "~/lib/models/amenities"

import { NewSpotModalView } from "./NewSpotModalView"

export default function NewSpotAmenitiesScreen() {
  const params = useLocalSearchParams()
  const [amenities, setAmenities] = React.useState(
    Object.keys(AMENITIES).reduce(
      (acc, key) => {
        acc[key as keyof typeof AMENITIES] = false
        return acc
      },
      {} as { [key in keyof typeof AMENITIES]: boolean },
    ),
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

      <View className="absolute bottom-12 left-4 right-4 flex items-center justify-center space-y-2">
        <Button
          className="rounded-full"
          onPress={() => {
            const searchParams = new URLSearchParams({ ...params, amenities: JSON.stringify(amenities) })
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
