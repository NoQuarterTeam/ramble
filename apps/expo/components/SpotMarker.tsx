import { View } from "react-native"
import { cva } from "class-variance-authority"
import { type ClassValue } from "class-variance-authority/dist/types"

import type { SpotType } from "@ramble/database/types"
import { spotMarkerColorTypes, spotMarkerTextColorTypes, spotMarkerTriangleColorTypes } from "@ramble/shared"

import { SpotIcon } from "./SpotIcon"

interface MarkerProps {
  spot: { type: SpotType }
}

export function SpotMarker(props: MarkerProps) {
  return (
    <View className="relative">
      <View className={spotMarkerColors({ type: props.spot.type })}>
        <SpotIcon type={props.spot.type} size={18} className={spotMarkerIconColors({ type: props.spot.type })} />
      </View>
      <View className={spotTriangleColors({ type: props.spot.type })} />
    </View>
  )
}

type MarkerConfig = { type: Record<SpotType, ClassValue> }

const spotMarkerColors = cva<MarkerConfig>("sq-8 flex items-center justify-center rounded-full border shadow-md", {
  variants: {
    type: spotMarkerColorTypes,
  },
})
const spotMarkerIconColors = cva("", {
  variants: {
    type: spotMarkerTextColorTypes,
  },
})

export const spotTriangleColors = cva<MarkerConfig>("sq-2 absolute -bottom-[2px] left-[12.5px] -z-[1] rotate-45", {
  variants: {
    type: spotMarkerTriangleColorTypes,
  },
})
