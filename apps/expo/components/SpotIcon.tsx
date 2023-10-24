import { type LucideProps } from "lucide-react-native"

import { type SpotType } from "@ramble/database/types"

import { SPOT_TYPES } from "../lib/models/spot"
import { Icon, IconColors } from "./Icon"

interface Props extends LucideProps {
  type: SpotType
  color?: IconColors
}

export function SpotIcon({ type, ...props }: Props) {
  const Comp = SPOT_TYPES[type].Icon
  return <Icon icon={Comp} {...props} />
}
