import type { LucideIcon } from "lucide-react"
import {
  Beer,
  Bike,
  Camera,
  Coffee,
  Dog,
  Footprints,
  Fuel,
  HeartHandshake,
  Leaf,
  Mountain,
  ParkingCircle,
  PartyPopper,
  PlugZap,
  ShoppingCart,
  Utensils,
  Wrench,
} from "lucide-react"

import { joinSpotImages, type LatestSpotImages, spotImagesRawQuery } from "@ramble/api"
import { SpotType } from "@ramble/database/types"
import { type SpotItemWithStatsAndImage } from "@ramble/shared"

import type { RambleIcon } from "~/components/ui"
import { Icons } from "~/components/ui"

import { db } from "../db.server"

export type SpotTypeInfo = {
  value: SpotType
  label: string
  Icon: RambleIcon
  isComingSoon: boolean
}
export const SPOT_TYPES: { [key in SpotType]: SpotTypeInfo } = {
  // Stays
  [SpotType.CAMPING]: { value: SpotType.CAMPING, label: "Long stay", Icon: Icons.Van, isComingSoon: false },
  [SpotType.FREE_CAMPING]: { value: SpotType.FREE_CAMPING, label: "Overnight stop-off", Icon: Icons.Timer, isComingSoon: false },
  [SpotType.PARKING]: { value: SpotType.PARKING, label: "Safe parking", Icon: ParkingCircle, isComingSoon: true },
  // Activities
  [SpotType.SURFING]: { value: SpotType.SURFING, label: "Surfing", Icon: Icons.Surf, isComingSoon: false },
  [SpotType.CLIMBING]: { value: SpotType.CLIMBING, label: "Climbing", Icon: Mountain, isComingSoon: false },
  [SpotType.MOUNTAIN_BIKING]: { value: SpotType.MOUNTAIN_BIKING, label: "MTBing", Icon: Bike, isComingSoon: false },
  [SpotType.PADDLE_KAYAK]: { value: SpotType.PADDLE_KAYAK, label: "SUPing / Kayaking", Icon: Icons.Sup, isComingSoon: false },
  [SpotType.HIKING_TRAIL]: {
    value: SpotType.HIKING_TRAIL,
    label: "Hiking / Trail running",
    Icon: Footprints,
    isComingSoon: false,
  },
  // Services
  [SpotType.GAS_STATION]: { value: SpotType.GAS_STATION, label: "Renewable diesel", Icon: Fuel, isComingSoon: false },
  [SpotType.ELECTRIC_CHARGE_POINT]: {
    value: SpotType.ELECTRIC_CHARGE_POINT,
    label: "Electric Charge Point",
    Icon: PlugZap,
    isComingSoon: true,
  },
  [SpotType.MECHANIC_PARTS]: { value: SpotType.MECHANIC_PARTS, label: "Mechanic / Parts", Icon: Wrench, isComingSoon: true },
  [SpotType.VET]: { value: SpotType.VET, label: "Vet", Icon: Dog, isComingSoon: true },
  // Hospitality
  [SpotType.CAFE]: { value: SpotType.CAFE, label: "Cafe", Icon: Coffee, isComingSoon: true },
  [SpotType.RESTAURANT]: { value: SpotType.RESTAURANT, label: "Restaurant", Icon: Utensils, isComingSoon: true },
  [SpotType.BAR]: { value: SpotType.BAR, label: "Bar", Icon: Beer, isComingSoon: true },
  [SpotType.SHOP]: { value: SpotType.SHOP, label: "Shop", Icon: ShoppingCart, isComingSoon: true },
  // Other
  [SpotType.REWILDING]: { value: SpotType.REWILDING, label: "Rewilding", Icon: Leaf, isComingSoon: false },
  [SpotType.NATURE_EDUCATION]: { value: SpotType.NATURE_EDUCATION, label: "Nature Education", Icon: Leaf, isComingSoon: true },
  [SpotType.FESTIVAL]: { value: SpotType.FESTIVAL, label: "Festival", Icon: PartyPopper, isComingSoon: true },
  [SpotType.ART_FILM_PHOTOGRAPHY]: {
    value: SpotType.ART_FILM_PHOTOGRAPHY,
    label: "Art, Film & Photography",
    Icon: Camera,
    isComingSoon: true,
  },
  [SpotType.VOLUNTEERING]: { value: SpotType.VOLUNTEERING, label: "Volunteering", Icon: HeartHandshake, isComingSoon: true },
} as const

export const SPOT_TYPE_OPTIONS = Object.entries(SPOT_TYPES).map(([_, val]) => val)

export const STAY_SPOT_TYPE_OPTIONS = Object.entries({
  [SpotType.CAMPING]: SPOT_TYPES.CAMPING,
  [SpotType.FREE_CAMPING]: SPOT_TYPES.FREE_CAMPING,
}).map(([_, { label, Icon, value, isComingSoon }]) => ({ label, value, Icon, isComingSoon })) as {
  label: string
  value: SpotType
  Icon: LucideIcon
  isComingSoon: boolean
}[]

export const fetchAndJoinSpotImages = async (spots: SpotItemWithStatsAndImage[]) => {
  // get spot images and join to original spot payload
  const images = spots.length > 0 && (await db.$queryRaw<LatestSpotImages>(spotImagesRawQuery(spots.map((s) => s.id))))
  images && joinSpotImages(spots, images)
}
