import { type LucideProps } from "lucide-react-native"

import { type SpotType } from "@ramble/database/types"

import { Icon, type IconColorProp } from "./Icon"
import { SPOT_TYPE_ICONS } from "../lib/models/spot"

interface Props extends Omit<LucideProps, "color"> {
  type: SpotType
  color?: IconColorProp
}

export function SpotIcon({ type, ...props }: Props) {
  const Comp = SPOT_TYPE_ICONS[type]
  return <Icon icon={Comp} {...props} />
}

export function SpotIconMap({ type, ...props }: Omit<Props, "color">) {
  const Comp = SPOT_TYPE_ICONS[type]
  return <Comp {...props} />
}
