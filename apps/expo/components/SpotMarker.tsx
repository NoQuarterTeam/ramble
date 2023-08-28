import type { SpotType } from "@ramble/database/types"
import { cva } from "class-variance-authority"
import { SPOTS } from "../lib/static/spots"
import { View } from "react-native"

interface MarkerProps {
  spot: { type: SpotType }
}

export function SpotMarker(props: MarkerProps) {
  const Icon = SPOTS[props.spot.type].Icon

  return (
    <View className="relative">
      <View className={spotMarkerColors({ type: props.spot.type })}>
        {Icon && <Icon className={spotMarkerIconColors({ type: props.spot.type })} />}
      </View>
      <View className={spotTriangleColors({ type: props.spot.type })} />
    </View>
  )
}

const spotMarkerColors = cva(
  "sq-8 flex cursor-pointer items-center justify-center rounded-full border shadow-md transition-transform hover:scale-110",
  {
    variants: {
      type: {
        CAMPING: "bg-primary-700 border-primary-100",
        FREE_CAMPING: "border-cyan-100 bg-cyan-800",
        SURFING: "border-blue-100 bg-blue-500",
        CLIMBING: "border-blue-100 bg-blue-500",
        MOUNTAIN_BIKING: "border-blue-100 bg-blue-500",
        PADDLE_BOARDING: "border-blue-100 bg-blue-500",
        HIKING: "border-blue-100 bg-blue-500",
        CAFE: "border-gray-500 bg-gray-50",
        GAS_STATION: "border-gray-500 bg-gray-50",
        BAR: "border-gray-500 bg-gray-50",
        RESTAURANT: "border-gray-500 bg-gray-50",
        PARKING: "border-gray-500 bg-gray-50",
        TIP: "border-gray-500 bg-gray-50",
        SHOP: "border-gray-500 bg-gray-50",
        OTHER: "border-gray-500 bg-gray-50",
      },
    },
  },
)
const spotMarkerIconColors = cva("sq-4", {
  variants: {
    type: {
      CAMPING: "text-white",
      FREE_CAMPING: "text-white",
      SURFING: "text-white",
      CLIMBING: "text-white",
      MOUNTAIN_BIKING: "text-white",
      PADDLE_BOARDING: "text-white",
      HIKING: "text-white",
      CAFE: "text-black",
      GAS_STATION: "text-black",
      BAR: "text-black",
      RESTAURANT: "text-black",
      PARKING: "text-black",
      TIP: "text-black",
      SHOP: "text-black",
      OTHER: "text-black",
    },
  },
})

export const spotTriangleColors = cva("sq-3 absolute -bottom-[3px] left-1/2 -z-[1] -translate-x-1/2 rotate-45 shadow", {
  variants: {
    type: {
      CAMPING: "bg-primary-600",
      FREE_CAMPING: "bg-cyan-800",
      SURFING: "bg-blue-700",
      CLIMBING: "bg-blue-700",
      MOUNTAIN_BIKING: "bg-blue-700",
      PADDLE_BOARDING: "bg-blue-700",
      HIKING: "bg-blue-700",
      CAFE: "bg-gray-100",
      GAS_STATION: "bg-gray-100",
      BAR: "bg-gray-100",
      RESTAURANT: "bg-gray-100",
      PARKING: "bg-gray-100",
      TIP: "bg-gray-100",
      SHOP: "bg-gray-100",
      OTHER: "bg-gray-100",
    },
  },
})
