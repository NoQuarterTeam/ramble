import { View } from "react-native"

import type { Spot } from "@ramble/database/types"
import { SPOT_TYPES } from "@ramble/shared"

import { SpotIcon } from "./SpotIcon"
import { Text } from "./ui/Text"

interface Props {
  spot: Pick<Spot, "type">
}

export function SpotTypeBadge(props: Props) {
  return (
    <View className="flex flex-row items-center space-x-1 rounded-full border border-gray-200 px-3 py-1.5 dark:border-gray-600">
      <SpotIcon type={props.spot.type} size={16} />
      <Text className="text-xs">{SPOT_TYPES[props.spot.type].label}</Text>
    </View>
  )
}
