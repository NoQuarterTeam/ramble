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
  Sprout,
  Utensils,
  Wrench,
} from "lucide-react-native"

import type { SpotType } from "@ramble/database/types"

import { Icons, type RambleIcon } from "~/components/ui/Icons"

export type SpotTypeIconInfo = {
  Icon: RambleIcon
}

export const SPOT_TYPE_ICONS = {
  // Stays
  CAMPING: Icons.Van,
  FREE_CAMPING: Icons.Timer,
  PARKING: ParkingCircle,
  // Activities
  SURFING: Icons.Surf,
  CLIMBING: Mountain,
  MOUNTAIN_BIKING: Bike,
  PADDLE_KAYAK: Icons.Sup,
  HIKING_TRAIL: Footprints,
  YOGA: Icons.Yoga,
  // Services
  GAS_STATION: Fuel,
  ELECTRIC_CHARGE_POINT: PlugZap,
  MECHANIC_PARTS: Wrench,
  VET: Dog,
  // Hospitality
  CAFE: Coffee,
  RESTAURANT: Utensils,
  BAR: Beer,
  SHOP: ShoppingCart,
  // Other
  REWILDING: Sprout,
  NATURE_EDUCATION: Leaf,
  FESTIVAL: PartyPopper,
  ART_FILM_PHOTOGRAPHY: Camera,
  VOLUNTEERING: HeartHandshake,
} satisfies Record<SpotType, RambleIcon>
