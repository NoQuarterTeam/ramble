import { SpotType } from "@travel/database/types"

import {
  Coffee,
  Utensils,
  Tent,
  ParkingCircle,
  Beer,
  Info,
  ShoppingCart,
  Mountain,
  Bike,
  Fuel,
  Waves,
  HelpCircle,
} from "lucide-react"

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
}

export const SPOT_OPTIONS = Object.entries(SPOTS).map(([value, { label, Icon }]) => ({ label, value, Icon }))
