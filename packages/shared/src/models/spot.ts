import type { Prisma, Spot, SpotImage, SpotType, User } from "@ramble/database/types"
import colors from "@ramble/tailwind-config/src/colors"

export type SpotTypeInfo = {
  value: SpotType
  label: string
  isComingSoon: boolean
}

export const SPOT_TYPES = {
  // Stays
  CAMPING: { value: "CAMPING", label: "Long stay", isComingSoon: false },
  FREE_CAMPING: { value: "FREE_CAMPING", label: "Overnight stop-off", isComingSoon: false },
  PARKING: { value: "PARKING", label: "Safe parking", isComingSoon: true },
  // Activities
  SURFING: { value: "SURFING", label: "Surfing", isComingSoon: false },
  CLIMBING: { value: "CLIMBING", label: "Climbing", isComingSoon: false },
  MOUNTAIN_BIKING: { value: "MOUNTAIN_BIKING", label: "MTBing", isComingSoon: false },
  PADDLE_KAYAK: { value: "PADDLE_KAYAK", label: "SUPing / Kayaking", isComingSoon: false },
  HIKING_TRAIL: { value: "HIKING_TRAIL", label: "Hiking / Trail running", isComingSoon: false },
  YOGA: { value: "YOGA", label: "Yoga", isComingSoon: true },
  // Services
  GAS_STATION: { value: "GAS_STATION", label: "Renewable diesel", isComingSoon: false },
  ELECTRIC_CHARGE_POINT: { value: "ELECTRIC_CHARGE_POINT", label: "Electric Charge Point", isComingSoon: true },
  MECHANIC_PARTS: { value: "MECHANIC_PARTS", label: "Mechanic / Parts", isComingSoon: true },
  VET: { value: "VET", label: "Vet", isComingSoon: true },
  // Hospitality
  CAFE: { value: "CAFE", label: "Cafe", isComingSoon: true },
  RESTAURANT: { value: "RESTAURANT", label: "Restaurant", isComingSoon: true },
  BAR: { value: "BAR", label: "Bar", isComingSoon: true },
  SHOP: { value: "SHOP", label: "Shop", isComingSoon: true },
  // Other
  REWILDING: { value: "REWILDING", label: "Rewilding", isComingSoon: false },
  NATURE_EDUCATION: { value: "NATURE_EDUCATION", label: "Nature Education", isComingSoon: true },
  FESTIVAL: { value: "FESTIVAL", label: "Festival", isComingSoon: true },
  ART_FILM_PHOTOGRAPHY: { value: "ART_FILM_PHOTOGRAPHY", label: "Art, Film & Photography", isComingSoon: true },
  VOLUNTEERING: { value: "VOLUNTEERING", label: "Volunteering", isComingSoon: true },
} satisfies Record<SpotType, SpotTypeInfo>

export const SPOT_TYPE_OPTIONS = Object.entries(SPOT_TYPES).map(([_, val]) => val)

// TODO: how to enforce all types? need const assertion
export const SPOT_TYPE_NAMES = [
  "CAMPING",
  "FREE_CAMPING",
  "PARKING",
  // Activities
  "SURFING",
  "CLIMBING",
  "MOUNTAIN_BIKING",
  "PADDLE_KAYAK",
  "HIKING_TRAIL",
  "YOGA",
  // Services
  "GAS_STATION",
  "ELECTRIC_CHARGE_POINT",
  "MECHANIC_PARTS",
  "VET",
  // Hospitality
  "CAFE",
  "RESTAURANT",
  "BAR",
  "SHOP",
  // Other
  "REWILDING",
  "NATURE_EDUCATION",
  "FESTIVAL",
  "ART_FILM_PHOTOGRAPHY",
  "VOLUNTEERING",
] as const

export const STAY_SPOT_TYPE_OPTIONS = Object.entries({
  CAMPING: SPOT_TYPES.CAMPING,
  FREE_CAMPING: SPOT_TYPES.FREE_CAMPING,
}).map(([_, { label, value, isComingSoon }]) => ({ label, value, isComingSoon })) as {
  label: string
  value: SpotType
  isComingSoon: boolean
}[]
export const spotPartnerFields = {
  campspaceId: true,
  cucortuId: true,
  komootId: true,
  park4nightId: true,
  loodusegakoosId: true,
  natuurKampeerterreinenId: true,
  roadsurferId: true,
  nesteId: true,
  hipcampId: true,
  surflineId: true,
  theCragId: true,
  norcampId: true,
  mossyEarthId: true,
  rewildingEuropeId: true,
  polskiCaravaningId: true,
  sourceUrl: true,
} satisfies Prisma.SpotSelect

export type SpotPartnerFields = Pick<Spot, keyof typeof spotPartnerFields>

export const isPartnerSpot = (spot: SpotPartnerFields) =>
  spot.campspaceId ||
  spot.surflineId ||
  spot.komootId ||
  spot.nesteId ||
  spot.hipcampId ||
  spot.park4nightId ||
  spot.roadsurferId ||
  spot.cucortuId ||
  spot.theCragId ||
  spot.loodusegakoosId ||
  spot.natuurKampeerterreinenId ||
  spot.norcampId ||
  spot.mossyEarthId ||
  spot.rewildingEuropeId ||
  spot.polskiCaravaningId

export const partners = {
  campspace: { name: "Campspace", logo: { light: "/partners/campspace.svg", dark: "/partners/campspace-dark.svg" } },
  komoot: { name: "Komoot", logo: { light: "/partners/komoot.svg", dark: "/partners/komoot-dark.svg" } },
  park4night: { name: "Park4Night", logo: { light: "/partners/park4night.svg", dark: "/partners/park4night-dark.svg" } },
  surfline: { name: "Surfline", logo: { light: "/partners/surfline.svg", dark: "/partners/surfline-dark.svg" } },
  natuur: { name: "Natuurkampeerterrein", logo: { light: "/partners/natuur.svg", dark: "/partners/natuur.svg" } },
  roadsurfer: { name: "Roadsurfer", logo: { light: "/partners/roadsurfer.svg", dark: "/partners/roadsurfer-dark.svg" } },
  loodusegakoos: { name: "Loodusega koos ", logo: { light: "/partners/loodusegakoos.svg", dark: "/partners/loodusegakoos.svg" } },
  cucortu: { name: "Cucortu'", logo: { light: "/partners/cucortu.png", dark: "/partners/cucortu-dark.png" } },
  theCrag: { name: "The Crag", logo: { light: "/partners/the-crag.svg", dark: "/partners/the-crag-dark.svg" } },
  neste: { name: "Neste", logo: { light: "/partners/neste.png", dark: "/partners/neste.png" } },
  hipcamp: { name: "Hipcamp", logo: { light: "/partners/hipcamp.svg", dark: "/partners/hipcamp-dark.svg" } },
  norcamp: { name: "Norcamp", logo: { light: "/partners/norcamp.png", dark: "/partners/norcamp.png" } },
  mossyEarth: { name: "Mossy Earth", logo: { light: "/partners/mossy-earth.png", dark: "/partners/mossy-earth-dark.png" } },
  rewildingEurope: {
    name: "Rewilding Europe",
    logo: { light: "/partners/rewilding-europe.png", dark: "/partners/rewilding-europe-dark.png" },
  },
  polskiCaravaning: {
    name: "Polski Caravaning",
    logo: { light: "/partners/polski-caravaning.svg", dark: "/partners/polski-caravaning.svg" },
  },
} as const

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
export function displaySaved(saved: number | string | null | undefined) {
  if (!saved) return null
  if (typeof saved === "string" && Number.parseInt(saved) > 50) return "50+"
  return saved
}

export function isCampingSpot(type?: SpotType | null | undefined) {
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
  YOGA: "border-blue-100 bg-blue-500",
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
  REWILDING: "border-gray-500 bg-gray-50",
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
  YOGA: "text-white",
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
  REWILDING: "text-black",
} satisfies Record<SpotType, string>

export const spotMarkerClusterColorTypes = {
  // stays
  CAMPING: colors.green[700],
  FREE_CAMPING: colors.cyan[800],
  PARKING: colors.gray[50],
  // activities
  SURFING: colors.blue[500],
  CLIMBING: colors.blue[500],
  MOUNTAIN_BIKING: colors.blue[500],
  HIKING_TRAIL: colors.blue[500],
  PADDLE_KAYAK: colors.blue[500],
  YOGA: colors.blue[500],
  // services
  GAS_STATION: colors.gray[50],
  ELECTRIC_CHARGE_POINT: colors.gray[50],
  MECHANIC_PARTS: colors.gray[50],
  VET: colors.gray[50],
  // hospitality
  BAR: colors.gray[50],
  CAFE: colors.gray[50],
  RESTAURANT: colors.gray[50],
  SHOP: colors.gray[50],
  // other
  ART_FILM_PHOTOGRAPHY: colors.gray[50],
  FESTIVAL: colors.gray[50],
  NATURE_EDUCATION: colors.gray[50],
  VOLUNTEERING: colors.gray[50],
  REWILDING: colors.gray[50],
} satisfies Record<SpotType, string>

export type SpotListSort = "latest" | "rated" | "saved" | "near"

export type SpotItemType = Pick<Spot, "id" | "name" | "address" | "type" | "latitude" | "longitude"> & {
  rating: string
  savedCount: string
  image?: SpotImage["path"] | null
  blurHash?: SpotImage["blurHash"] | null
  distanceFromMe?: number | null
}
