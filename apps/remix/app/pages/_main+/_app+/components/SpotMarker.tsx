import type { SpotType } from "@ramble/database/types"
import { join } from "@ramble/shared"

import { SPOTS } from "~/lib/static/spots"

interface MarkerProps {
  spot: { type: SpotType }
}

export function SpotMarker(props: MarkerProps) {
  const Icon = SPOTS[props.spot.type].Icon
  const isPrimary = SPOTS[props.spot.type].isPrimary
  return (
    <div className="relative">
      <div
        className={join(
          "sq-8 flex cursor-pointer items-center justify-center rounded-full border shadow-md transition-transform hover:scale-110",
          isPrimary
            ? "bg-primary-600 dark:bg-primary-700 border-primary-100 dark:border-primary-600"
            : "border-gray-500 bg-gray-50 dark:border-gray-400 dark:bg-black",
        )}
      >
        {Icon && <Icon className={join("sq-4", isPrimary ? "text-white" : "text-black")} />}
      </div>
      <div
        className={join(
          "sq-3 absolute -bottom-[3px] left-1/2 -z-[1] -translate-x-1/2 rotate-45 shadow",
          isPrimary ? "bg-primary-600 dark:bg-primary-700" : "bg-white dark:bg-black",
        )}
      />
    </div>
  )
}
