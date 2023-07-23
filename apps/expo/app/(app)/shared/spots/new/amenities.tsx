import * as React from "react"
import { ScrollView, Switch, View } from "react-native"

import { AMENITIES } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Button } from "../../../../../components/ui/Button"
import { Text } from "../../../../../components/ui/Text"
import { useParams, useRouter } from "../../../../router"
import { NewSpotModalView } from "./NewSpotModalView"
import { AMENITIES_ICONS } from "../../../../../lib/static/amenities"
import { RambleIcon } from "../../../../../components/ui/Icons"

export function NewSpotAmenitiesScreen() {
  const { params } = useParams<"NewSpotAmenitiesScreen">()
  const [amenities, setAmenities] = React.useState(
    Object.keys(AMENITIES).reduce((acc, key) => ({ ...acc, [key]: false }), {} as { [key in keyof typeof AMENITIES]: boolean }),
  )

  const router = useRouter()
  return (
    <NewSpotModalView title="What it's got?">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {Object.entries(AMENITIES).map(([key, label]) => (
          <AmenitySelector
            key={key}
            label={label}
            Icon={AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]}
            isSelected={!!amenities[key as keyof typeof AMENITIES]}
            onToggle={() => setAmenities((a) => ({ ...a, [key]: !a[key as keyof typeof AMENITIES] }))}
          />
        ))}
      </ScrollView>

      <View className="absolute bottom-12 left-4 flex space-y-2 right-4 items-center justify-center">
        <Button className="rounded-full" onPress={() => router.push("NewSpotImagesScreen", { ...params, amenities })}>
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
  Icon,
}: {
  label: string
  isSelected: boolean
  onToggle: () => void
  Icon: RambleIcon | null
}) {
  return (
    <View className="flex w-full flex-row items-center justify-between py-1">
      <View className="flex items-center flex-row space-x-1">
        {Icon && <Icon size={20} className="text-black dark:text-white" />}
        <Text className="text-xl">{label}</Text>
      </View>
      <Switch trackColor={{ true: colors.primary[600] }} value={isSelected} onValueChange={onToggle} />
    </View>
  )
}
