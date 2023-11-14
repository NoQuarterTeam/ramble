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
  type LucideIcon,
  Mountain,
  ParkingCircle,
  PartyPopper,
  PlugZap,
  ShoppingCart,
  Utensils,
  Wrench,
  Sprout,
} from "lucide-react-native"

import { type SpotType } from "@ramble/database/types"

import { Icons, type RambleIcon } from "../../components/ui/Icons"

export type SpotTypeInfo = {
  value: SpotType
  label: string
  Icon: RambleIcon
  isComingSoon: boolean
}
export const SPOT_TYPES: { [key in SpotType]: { value: SpotType; label: string; Icon: RambleIcon; isComingSoon: boolean } } = {
  // Stays
  CAMPING: { value: "CAMPING", label: "Long stay", Icon: Icons.Van, isComingSoon: false },
  FREE_CAMPING: { value: "FREE_CAMPING", label: "Overnight stop-off", Icon: Icons.Timer, isComingSoon: false },
  PARKING: { value: "PARKING", label: "Safe parking", Icon: ParkingCircle, isComingSoon: true },
  // Activities
  SURFING: { value: "SURFING", label: "Surfing", Icon: Icons.Surf, isComingSoon: false },
  CLIMBING: { value: "CLIMBING", label: "Climbing", Icon: Mountain, isComingSoon: false },
  MOUNTAIN_BIKING: { value: "MOUNTAIN_BIKING", label: "MTBing", Icon: Bike, isComingSoon: false },
  PADDLE_KAYAK: { value: "PADDLE_KAYAK", label: "SUPing / Kayaking", Icon: Icons.Sup, isComingSoon: false },
  HIKING_TRAIL: {
    value: "HIKING_TRAIL",
    label: "Hiking / Trail running",
    Icon: Footprints,
    isComingSoon: false,
  },
  // Services
  GAS_STATION: { value: "GAS_STATION", label: "Renewable diesel", Icon: Fuel, isComingSoon: false },
  ELECTRIC_CHARGE_POINT: {
    value: "ELECTRIC_CHARGE_POINT",
    label: "Electric Charge Point",
    Icon: PlugZap,
    isComingSoon: true,
  },
  MECHANIC_PARTS: { value: "MECHANIC_PARTS", label: "Mechanic / Parts", Icon: Wrench, isComingSoon: true },
  VET: { value: "VET", label: "Vet", Icon: Dog, isComingSoon: true },
  // Hospitality
  CAFE: { value: "CAFE", label: "Cafe", Icon: Coffee, isComingSoon: true },
  RESTAURANT: { value: "RESTAURANT", label: "Restaurant", Icon: Utensils, isComingSoon: true },
  BAR: { value: "BAR", label: "Bar", Icon: Beer, isComingSoon: true },
  SHOP: { value: "SHOP", label: "Shop", Icon: ShoppingCart, isComingSoon: true },
  // Other
  REWILDING: { value: "REWILDING", label: "Rewilding", Icon: Sprout, isComingSoon: false },
  NATURE_EDUCATION: { value: "NATURE_EDUCATION", label: "Nature Education", Icon: Leaf, isComingSoon: true },
  FESTIVAL: { value: "FESTIVAL", label: "Festival", Icon: PartyPopper, isComingSoon: true },
  ART_FILM_PHOTOGRAPHY: {
    value: "ART_FILM_PHOTOGRAPHY",
    label: "Art, Film & Photography",
    Icon: Camera,
    isComingSoon: true,
  },
  VOLUNTEERING: { value: "VOLUNTEERING", label: "Volunteering", Icon: HeartHandshake, isComingSoon: true },
} satisfies Record<SpotType, SpotTypeInfo>

export const SPOT_OPTIONS = Object.entries(SPOT_TYPES).map(([value, { label, Icon, isComingSoon }]) => ({
  label,
  value,
  Icon,
  isComingSoon,
})) as {
  label: string
  value: SpotType
  Icon: LucideIcon
  isComingSoon: boolean
}[]
