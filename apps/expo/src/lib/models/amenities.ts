import { Droplet, Flame, ShowerHead, Thermometer, UtensilsCrossed, Wifi, Zap } from "lucide-react-native"

import { Icons } from "~/components/ui/Icons"

export const AMENITIES_ICONS = {
  bbq: Icons.Bbq,
  electricity: Zap,
  water: Droplet,
  toilet: Icons.Toilet,
  shower: ShowerHead,
  wifi: Wifi,
  kitchen: UtensilsCrossed,
  pool: Icons.Pool,
  hotWater: Thermometer,
  firePit: Flame,
  sauna: Icons.Sauna,
}
