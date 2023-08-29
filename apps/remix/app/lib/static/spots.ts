import type { LucideIcon } from "lucide-react"
import {
  Beer,
  Bike,
  Coffee,
  Footprints,
  Fuel,
  HelpCircle,
  Info,
  Mountain,
  ParkingCircle,
  ShoppingCart,
  Tent,
  Utensils,
} from "lucide-react"

import type { SpotType } from "@ramble/database/types"

import type { RambleIcon } from "~/components/ui"
import { Icons } from "~/components/ui"

export const SPOTS: { [key in SpotType]: { label: string; Icon: RambleIcon } } = {
  CAMPING: { label: "Camping", Icon: Tent },
  FREE_CAMPING: { label: "Free Camping", Icon: Tent },
  SURFING: { label: "Surfing", Icon: Icons.Surf },
  CLIMBING: { label: "Climbing", Icon: Mountain },
  MOUNTAIN_BIKING: { label: "Mountain Biking", Icon: Bike },
  PADDLE_BOARDING: { label: "Paddle Boarding", Icon: Icons.Sup },
  HIKING: { label: "Hiking", Icon: Footprints },
  CAFE: { label: "Cafe", Icon: Coffee },
  GAS_STATION: { label: "Gas Station", Icon: Fuel },
  BAR: { label: "Bar", Icon: Beer },
  RESTAURANT: { label: "Restaurant", Icon: Utensils },
  PARKING: { label: "Parking", Icon: ParkingCircle },
  TIP: { label: "Tip", Icon: Info },
  SHOP: { label: "Shop", Icon: ShoppingCart },
  OTHER: { label: "Other", Icon: HelpCircle },
} as const

export const SPOT_TYPE_OPTIONS = Object.entries(SPOTS).map(([value, { label, Icon }]) => ({ label, value, Icon })) as {
  label: string
  value: SpotType
  Icon: LucideIcon
}[]
