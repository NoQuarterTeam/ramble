import {
  Beer,
  Bike,
  Coffee,
  Footprints,
  Fuel,
  HelpCircle,
  Info,
  type LucideIcon,
  Mountain,
  ParkingCircle,
  ShoppingCart,
  Tent,
  Utensils,
  Dog,
  PartyPopper,
  PlugZap,
  Wrench,
} from "lucide-react-native"

import type { SpotType } from "@ramble/database/types"

import { Icons, RambleIcon } from "../../components/ui/Icons"

export const SPOTS: { [key in SpotType]: { label: string; Icon: RambleIcon; isComingSoon: boolean } } = {
  // Stays
  CAMPING: { label: "Camping", Icon: Tent, isComingSoon: false },
  FREE_CAMPING: { label: "Free Camping", Icon: Tent, isComingSoon: false },
  PARKING: { label: "Parking", Icon: ParkingCircle, isComingSoon: true },
  // Activities
  SURFING: { label: "Surfing", Icon: Icons.Surf, isComingSoon: false },
  CLIMBING: { label: "Climbing", Icon: Mountain, isComingSoon: false },
  MOUNTAIN_BIKING: { label: "Mountain Biking", Icon: Bike, isComingSoon: false },
  PADDLE_BOARDING: { label: "Paddle Boarding", Icon: Icons.Sup, isComingSoon: false },
  PADDLE_KAYAK: { label: "SUPing / Kayaking", Icon: Icons.Sup, isComingSoon: false },
  HIKING: { label: "Hiking", Icon: Footprints, isComingSoon: false },
  HIKING_TRAIL: { label: "Hiking / Trail running", Icon: Footprints, isComingSoon: false },
  // Services
  GAS_STATION: { label: "Renewable diesel", Icon: Fuel, isComingSoon: false },
  ELECTRIC_CHARGE_POINT: { label: "Electric Charge Point", Icon: PlugZap, isComingSoon: true },
  MECHANIC_PARTS: { label: "Mechanic or Parts", Icon: Wrench, isComingSoon: true },
  VET: { label: "Vet", Icon: Dog, isComingSoon: true },
  // Hospitality
  CAFE: { label: "Cafe", Icon: Coffee, isComingSoon: false },
  RESTAURANT: { label: "Restaurant", Icon: Utensils, isComingSoon: false },
  BAR: { label: "Bar", Icon: Beer, isComingSoon: false },
  SHOP: { label: "Shop", Icon: ShoppingCart, isComingSoon: false },
  // Other
  NATURE_EDUCATION: { label: "Nature Education", Icon: Info, isComingSoon: true },
  FESTIVAL: { label: "Festival", Icon: PartyPopper, isComingSoon: true },
  ART_FILM_PHOTOGRAPHY: { label: "Art / Film / Photography", Icon: HelpCircle, isComingSoon: true },
  VOLUNTEERING: { label: "Volunteering", Icon: HelpCircle, isComingSoon: true },
} as const

export const SPOT_OPTIONS = Object.entries(SPOTS).map(([value, { label, Icon }]) => ({ label, value, Icon })) as {
  label: string
  value: SpotType
  Icon: LucideIcon
}[]
