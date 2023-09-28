import { type LucideProps } from "lucide-react"

import { type SpotType } from "@ramble/database/types"

import { SPOTS } from "~/lib/models/spots"

interface Props extends LucideProps {
  type: SpotType
}

export function SpotIcon({ type, ...props }: Props) {
  const Icon = SPOTS[type].Icon
  return <Icon {...props} />
}
