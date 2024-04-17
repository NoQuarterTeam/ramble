import { Bike, Dog, Footprints, type LucideProps, Mountain } from "lucide-react-native"

import { Icons } from "~/components/ui/Icons"

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
    Icon: Icons.Sup,
  },
  {
    label: "Yoga",
    value: "isYogi",
    Icon: Icons.Yoga,
  },
]
