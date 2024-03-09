import type { Spot } from "@ramble/database/types"
import { SPOT_TYPES } from "@ramble/shared"

import { SpotIcon } from "./SpotIcon"

interface Props {
  spot: Pick<Spot, "type">
}

export function SpotTypeBadge(props: Props) {
  return (
    <div className="flex w-fit flex-shrink-0 flex-grow-0 items-center justify-center space-x-2 rounded-full border border-gray-200 px-3 py-2 dark:border-gray-600">
      <SpotIcon type={props.spot.type} className="sq-4" />
      <p className="text-sm">{SPOT_TYPES[props.spot.type].label}</p>
    </div>
  )
}
