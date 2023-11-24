import { Spot } from "@ramble/database/types"
import { SpotIcon } from "./SpotIcon"

interface Props {
  spot: Pick<Spot, "type">
}

export function SpotTypeBadge(props: Props) {
  return (
    <div className="flex flex-shrink-0 items-center justify-center rounded-full border border-gray-200 px-3 py-2 dark:border-gray-600">
      <SpotIcon type={props.spot.type} className="sq-4" />
    </div>
  )
}
