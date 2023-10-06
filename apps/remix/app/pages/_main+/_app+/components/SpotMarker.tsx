import { cva } from "class-variance-authority"

import type { SpotType } from "@ramble/database/types"

import { SpotIcon } from "~/components/SpotIcon"
import { ClassValue } from "class-variance-authority/types"
import { spotMarkerColorTypes, spotMarkerTextColorTypes, spotMarkerTriangleColorTypes } from "@ramble/shared"

interface MarkerProps {
  spot: { type: SpotType }
  isInteractable?: boolean
}

export function SpotMarker({ isInteractable = true, ...props }: MarkerProps) {
  return (
    <div className="relative">
      <div className={spotMarker({ type: props.spot.type, isInteractable })}>
        <SpotIcon type={props.spot.type} className={spotMarkerIconColors({ type: props.spot.type })} />
      </div>
      <div className={spotTriangleColors({ type: props.spot.type })} />
    </div>
  )
}

type MarkerConfig = { type: Record<SpotType, ClassValue>; isInteractable: Record<"true", ClassValue> }

const spotMarker = cva<MarkerConfig>("sq-8 flex items-center justify-center rounded-full border shadow-md", {
  variants: {
    type: spotMarkerColorTypes,
    isInteractable: {
      true: "cursor-pointer transition-transform hover:scale-110",
    },
  },
})

type MarkerIconConfig = { type: Record<SpotType, ClassValue> }

const spotMarkerIconColors = cva<MarkerIconConfig>("sq-4", {
  variants: {
    type: spotMarkerTextColorTypes,
  },
})

export const spotTriangleColors = cva<MarkerIconConfig>(
  "sq-3 absolute -bottom-[3px] left-1/2 -z-[1] -translate-x-1/2 rotate-45 shadow",
  {
    variants: {
      type: spotMarkerTriangleColorTypes,
    },
  },
)
