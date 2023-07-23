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
  Waves,
} from "lucide-react"

import type { Spot, SpotType, User } from "@ramble/database/types"

import type { RambleIcon } from "~/components/ui"
import { Icons } from "~/components/ui"

export const SPOTS: { [key in SpotType]: { label: string; Icon: RambleIcon } } = {
  CAFE: { label: "Cafe", Icon: Coffee },
  RESTAURANT: { label: "Restaurant", Icon: Utensils },
  CAMPING: { label: "Camping", Icon: Tent },
  PARKING: { label: "Parking", Icon: ParkingCircle },
  SURFING: { label: "Surfing", Icon: Icons.Surf },
  HIKING: { label: "Hiking", Icon: Footprints },
  BAR: { label: "Bar", Icon: Beer },
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

export const canManageSpot = (spot: Pick<Spot, "ownerId"> | null, user: Pick<User, "id" | "role"> | null) => {
  if (!user) return false
  if (!spot) return false
  if (user.role === "ADMIN") return true
  if (user.role === "AMBASSADOR") return true
  if (!spot.ownerId) return false
  if (user.role === "OWNER" && user.id === spot.ownerId) return true
  if (spot.ownerId === user.id) return true
  return false
}
