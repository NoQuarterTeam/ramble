import type { LucideProps } from "lucide-react"

import type { SpotType } from "@ramble/database/types"

import { SPOT_TYPE_ICONS } from "@/lib/models/spot"

interface Props extends LucideProps {
  type: SpotType
}

export function SpotIcon({ type, ...props }: Props) {
  const Icon = SPOT_TYPE_ICONS[type]
  return <Icon {...props} />
}
