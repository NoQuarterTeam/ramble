import type { LucideIcon } from "lucide-react"
import {
  Beer,
  Bike,
  Coffee,
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

import type { Spot, User } from "@ramble/database/types"
import { SpotType } from "@ramble/database/types"

export const SPOTS = {
  [SpotType.CAFE]: { label: "Cafe", Icon: Coffee },
  [SpotType.RESTAURANT]: { label: "Restaurant", Icon: Utensils },
  [SpotType.CAMPING]: { label: "Camping", Icon: Tent },
  [SpotType.PARKING]: { label: "Parking", Icon: ParkingCircle },
  [SpotType.BAR]: { label: "Bar", Icon: Beer },
  [SpotType.TIP]: { label: "Tip", Icon: Info },
  [SpotType.SHOP]: { label: "Shop", Icon: ShoppingCart },
  [SpotType.CLIMBING]: { label: "Climbing", Icon: Mountain },
  [SpotType.MOUNTAIN_BIKING]: { label: "Mountain Biking", Icon: Bike },
  [SpotType.GAS_STATION]: { label: "Gas Station", Icon: Fuel },
  [SpotType.PADDLE_BOARDING]: { label: "Paddle Boarding", Icon: Waves },
  [SpotType.OTHER]: { label: "Other", Icon: HelpCircle },
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
  return false
}
