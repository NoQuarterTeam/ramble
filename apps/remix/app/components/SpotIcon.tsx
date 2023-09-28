import { SpotType } from "@ramble/database/types"
import { SPOTS } from "~/lib/static/spots"

import { LucideProps } from "lucide-react"

interface Props extends LucideProps {
  type: SpotType
}

export function SpotIcon({ type, ...props }: Props) {
  const Icon = SPOTS[type].Icon
  return <Icon {...props} />
}
