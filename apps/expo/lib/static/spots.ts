import {
  Beer,
  Bike,
  Coffee,
  Footprints,
  Fuel,
  HelpCircle,
  Info,
  type LucideIcon,
  type LucideProps,
  Mountain,
  ParkingCircle,
  ShoppingCart,
  Tent,
  Utensils,
  Waves,
} from "lucide-react-native"

import type { SpotType } from "@ramble/database/types"

import { Icons } from "../../components/ui/Icons"

export const SPOTS: { [key in SpotType]: { label: string; Icon: (props: LucideProps) => JSX.Element } } = {
  CAFE: { label: "Cafe", Icon: Coffee },
  RESTAURANT: { label: "Restaurant", Icon: Utensils },
  CAMPING: { label: "Camping", Icon: Tent },
  PARKING: { label: "Parking", Icon: ParkingCircle },
  BAR: { label: "Bar", Icon: Beer },
  SURFING: { label: "Surfing", Icon: Icons.Surf },
  HIKING: { label: "Hiking", Icon: Footprints },
  TIP: { label: "Tip", Icon: Info },
  SHOP: { label: "Shop", Icon: ShoppingCart },
  CLIMBING: { label: "Climbing", Icon: Mountain },
  MOUNTAIN_BIKING: { label: "Mountain Biking", Icon: Bike },
  GAS_STATION: { label: "Gas Station", Icon: Fuel },
  PADDLE_BOARDING: { label: "Paddle Boarding", Icon: Waves },
  OTHER: { label: "Other", Icon: HelpCircle },
} as const

export const SPOT_OPTIONS = Object.entries(SPOTS).map(([value, { label, Icon }]) => ({ label, value, Icon })) as {
  label: string
  value: SpotType
  Icon: LucideIcon
}[]
