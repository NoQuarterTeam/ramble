import { type LucideProps } from "lucide-react-native"

import { type SpotType } from "@ramble/database/types"
import { SPOT_TYPES } from "../lib/models/spot"

interface Props extends LucideProps {
  type: SpotType
}

export function SpotIcon({ type, ...props }: Props) {
  const Icon = SPOT_TYPES[type].Icon
  return <Icon {...props} />
}
