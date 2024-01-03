import { RambleIcon } from "./ui/Icons"
import { Text } from "./ui/Text"
import { Switch, View } from "react-native"
import { Icon } from "./Icon"
import colors from "@ramble/tailwind-config/src/colors"
import { AMENITIES } from "@ramble/shared"

export type AmenityObject = { [key in keyof typeof AMENITIES]: boolean }

export function AmenitySelector({
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
