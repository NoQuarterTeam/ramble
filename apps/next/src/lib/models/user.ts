import { Bike, Dog, Footprints, Mountain } from "lucide-react"

import type { RambleIcon } from "../../components/ui/Icons"
import { Icons } from "../../components/ui/Icons"

export const interestOptions: { label: string; value: string; Icon: RambleIcon }[] = [
  {
    label: "Surfing",
    value: "isSurfer",
    Icon: Icons.Surf,
  },
  {
    label: "Climbing",
    value: "isClimber",
    Icon: Mountain,
  },
  {
    label: "Hiking",
    value: "isHiker",
    Icon: Footprints,
  },
  {
    label: "Mountain Biking",
    value: "isMountainBiker",
    Icon: Bike,
  },
  {
    label: "Pet Owner",
    value: "isPetOwner",
    Icon: Dog,
  },
  {
    label: "Paddle Boarding",
    value: "isPaddleBoarder",
    Icon: Icons.Sup,
  },
]
