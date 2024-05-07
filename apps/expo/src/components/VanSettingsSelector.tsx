import { join } from "@ramble/shared"
import { Check } from "lucide-react-native"
import { TouchableOpacity, View } from "react-native"
import { Icon } from "./Icon"
import type { IconProps } from "./ui/Icons"
import { Text } from "./ui/Text"

export function VanSettingSelector({
  label,
  isSelected,
  onToggle,
  icon,
}: {
  isSelected: boolean
  onToggle: () => void
  label: string
  icon: (props: IconProps) => JSX.Element
}) {
  return (
    <TouchableOpacity
      className={join(
        "flex relative h-[100px] w-full items-center justify-center border-gray-200 dark:border-gray-700 p-4 border rounded-sm",
        isSelected && "border-primary",
      )}
      onPress={onToggle}
    >
      <Icon icon={icon} className="h-4 w-4" />
      <Text className="text-base pt-2 text-center leading-5">{label}</Text>
      {isSelected && (
        <View className="absolute top-2 right-2 bg-primary flex items-center justify-center rounded-full h-5 w-5">
          <Icon icon={Check} color="white" size={12} />
        </View>
      )}
    </TouchableOpacity>
  )
}
