import type { LucideProps } from "lucide-react"
import { Bike, Dog, Footprints, Mountain, Waves } from "lucide-react"

import { Icons } from "../components/ui/Icons"

export const interestOptions: { label: string; value: string; Icon: (props: LucideProps) => JSX.Element }[] = [
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
    Icon: Waves,
  },
]
