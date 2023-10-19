import type { Prisma, Spot, SpotImage, SpotType, User } from "@ramble/database/types"

export const spotPartnerFields = {
  campspaceId: true,
  cucortuId: true,
  komootId: true,
  park4nightId: true,
  loodusegakoosId: true,
  natuurKampeerterreinenId: true,
  roadsurferId: true,
  nesteId: true,
  surflineId: true,
  theCragId: true,
  sourceUrl: true,
} satisfies Prisma.SpotSelect

export type SpotPartnerFields = Pick<Spot, keyof typeof spotPartnerFields>

export const isPartnerSpot = (spot: SpotPartnerFields) =>
  spot.campspaceId ||
  spot.surflineId ||
  spot.komootId ||
  spot.nesteId ||
  spot.park4nightId ||
  spot.roadsurferId ||
  spot.cucortuId ||
  spot.theCragId ||
  spot.loodusegakoosId ||
  spot.natuurKampeerterreinenId

export type SpotItemWithStatsAndImage = Pick<Spot, "id" | "name" | "address" | "type"> & {
  rating: string
  savedCount: string
  image?: SpotImage["path"] | null
  blurHash?: SpotImage["blurHash"] | null
}

export const canManageSpot = (
  spot: Pick<Spot, "ownerId"> | null,
  user: Pick<User, "id" | "isAdmin" | "role" | "isVerified"> | null | undefined,
) => {
  if (!user) return false
  if (!spot) return false
  if (user.isAdmin) return true
  if (!user.isVerified) return false
  if (user.role === "GUIDE") return true
  if (!spot.ownerId) return false
  if (user.role === "OWNER" && user.id === spot.ownerId) return true
  if (spot.ownerId === user.id) return true
  return false
}

export function displayRating(rating: number | string | null | undefined) {
  if (!rating) return "New"
  return Math.round(Number(rating) * 100) / 100
}

export function doesSpotTypeRequireAmenities(type?: SpotType | null | undefined) {
  if (!type) return false
  return type === "CAMPING" || type === "FREE_CAMPING"
}
export function doesSpotTypeRequireDescription(type?: SpotType | null | undefined) {
  if (!type) return false
  return type === "CAMPING" || type === "FREE_CAMPING"
}

export const activitySpotTypes = ["CLIMBING", "CLIMBING", "HIKING_TRAIL", "PADDLE_KAYAK", "MOUNTAIN_BIKING"] as SpotType[]

export const spotMarkerColorTypes = {
  // stays
  CAMPING: "border-green-100 bg-green-700",
  FREE_CAMPING: "border-cyan-100 bg-cyan-800",
  PARKING: "border-gray-500 bg-gray-50",
  // activities
  SURFING: "border-blue-100 bg-blue-500",
  CLIMBING: "border-blue-100 bg-blue-500",
  MOUNTAIN_BIKING: "border-blue-100 bg-blue-500",
  HIKING_TRAIL: "border-blue-100 bg-blue-500",
  PADDLE_KAYAK: "border-blue-100 bg-blue-500",
  // services
  GAS_STATION: "border-gray-500 bg-gray-50",
  ELECTRIC_CHARGE_POINT: "border-gray-500 bg-gray-50",
  MECHANIC_PARTS: "border-gray-500 bg-gray-50",
  VET: "border-gray-500 bg-gray-50",
  // hospitality
  BAR: "border-gray-500 bg-gray-50",
  CAFE: "border-gray-500 bg-gray-50",
  RESTAURANT: "border-gray-500 bg-gray-50",
  SHOP: "border-gray-500 bg-gray-50",
  // other
  ART_FILM_PHOTOGRAPHY: "border-gray-500 bg-gray-50",
  FESTIVAL: "border-gray-500 bg-gray-50",
  NATURE_EDUCATION: "border-gray-500 bg-gray-50",
  VOLUNTEERING: "border-gray-500 bg-gray-50",
} satisfies Record<SpotType, string>

export const spotMarkerTextColorTypes = {
  // stays
  CAMPING: "text-white",
  FREE_CAMPING: "text-white",
  PARKING: "text-black",
  // activities
  SURFING: "text-white",
  CLIMBING: "text-white",
  MOUNTAIN_BIKING: "text-white",
  HIKING_TRAIL: "text-white",
  PADDLE_KAYAK: "text-white",
  // services
  GAS_STATION: "text-black",
  ELECTRIC_CHARGE_POINT: "text-black",
  MECHANIC_PARTS: "text-black",
  VET: "text-black",
  // hospitality
  BAR: "text-black",
  CAFE: "text-black",
  RESTAURANT: "text-black",
  SHOP: "text-black",
  // other
  ART_FILM_PHOTOGRAPHY: "text-black",
  FESTIVAL: "text-black",
  NATURE_EDUCATION: "text-black",
  VOLUNTEERING: "text-black",
} satisfies Record<SpotType, string>

export const spotMarkerTriangleColorTypes = {
  CAMPING: "bg-green-600",
  FREE_CAMPING: "bg-cyan-700",
  PARKING: "bg-gray-100",
  // activities
  SURFING: "bg-blue-600",
  CLIMBING: "bg-blue-600",
  MOUNTAIN_BIKING: "bg-blue-600",
  HIKING_TRAIL: "bg-blue-600",
  PADDLE_KAYAK: "bg-blue-600",
  // services
  GAS_STATION: "bg-gray-100",
  ELECTRIC_CHARGE_POINT: "bg-gray-100",
  MECHANIC_PARTS: "bg-gray-100",
  VET: "bg-gray-100",
  // hospitality
  BAR: "bg-gray-100",
  CAFE: "bg-gray-100",
  RESTAURANT: "bg-gray-100",
  SHOP: "bg-gray-100",
  // other
  ART_FILM_PHOTOGRAPHY: "bg-gray-100",
  FESTIVAL: "bg-gray-100",
  NATURE_EDUCATION: "bg-gray-100",
  VOLUNTEERING: "bg-gray-100",
} satisfies Record<SpotType, string>
