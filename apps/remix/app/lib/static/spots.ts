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

export const SPOTS: { [key in SpotType]: { label: string; Icon: RambleIcon; isPrimary: boolean } } = {
  CAMPING: { isPrimary: true, label: "Camping", Icon: Tent },
  FREE_CAMPING: { isPrimary: true, label: "Free Camping", Icon: Tent },
  SURFING: { isPrimary: true, label: "Surfing", Icon: Icons.Surf },
  CLIMBING: { isPrimary: true, label: "Climbing", Icon: Mountain },
  MOUNTAIN_BIKING: { isPrimary: true, label: "Mountain Biking", Icon: Bike },
  PADDLE_BOARDING: { isPrimary: true, label: "Paddle Boarding", Icon: Icons.Sup },
  HIKING: { isPrimary: true, label: "Hiking", Icon: Footprints },
  CAFE: { isPrimary: false, label: "Cafe", Icon: Coffee },
  GAS_STATION: { isPrimary: false, label: "Gas Station", Icon: Fuel },
  BAR: { isPrimary: false, label: "Bar", Icon: Beer },
  RESTAURANT: { isPrimary: false, label: "Restaurant", Icon: Utensils },
  PARKING: { isPrimary: false, label: "Parking", Icon: ParkingCircle },
  TIP: { isPrimary: false, label: "Tip", Icon: Info },
  SHOP: { isPrimary: false, label: "Shop", Icon: ShoppingCart },
  OTHER: { isPrimary: false, label: "Other", Icon: HelpCircle },
} as const

export const SPOT_TYPE_OPTIONS = Object.entries(SPOTS).map(([value, { label, Icon }]) => ({ label, value, Icon })) as {
  label: string
  value: SpotType
  Icon: LucideIcon
}[]
