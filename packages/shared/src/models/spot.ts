import type { Prisma, Spot, SpotImage, SpotType, User } from "@ramble/database/types"
import colors from "@ramble/tailwind-config/src/colors"

export type SpotTypeInfo = {
  value: SpotType
  label: string
  isComingSoon: boolean
  isArchived: boolean
  category: "STAY" | "ACTIVITY" | "SERVICE" | "HOSPITALITY" | "OTHER"
}

export const SPOT_TYPES = {
  // Stays
  CAMPING: { isArchived: false, value: "CAMPING", label: "Camping", isComingSoon: false, category: "STAY" },
  VAN_PARK: { isArchived: false, value: "VAN_PARK", label: "Van park", isComingSoon: false, category: "STAY" },
  CARPARK: { isArchived: false, value: "CARPARK", label: "Car park", isComingSoon: false, category: "STAY" },
  PRIVATE_LAND: { isArchived: false, value: "PRIVATE_LAND", label: "Private land", isComingSoon: false, category: "STAY" },
  ROADSIDE: { isArchived: false, value: "ROADSIDE", label: "Roadside", isComingSoon: false, category: "STAY" },
  /**
   * @deprecated in 1.4.11, migrate to others
   */
  FREE_CAMPING: { value: "FREE_CAMPING", label: "Overnight stop-off", isComingSoon: false, category: "STAY", isArchived: true },
  // Activities
  SURFING: { isArchived: false, value: "SURFING", label: "Surfing", isComingSoon: false, category: "ACTIVITY" },
  CLIMBING: { isArchived: false, value: "CLIMBING", label: "Climbing", isComingSoon: false, category: "ACTIVITY" },
  MOUNTAIN_BIKING: { isArchived: false, value: "MOUNTAIN_BIKING", label: "MTBing", isComingSoon: false, category: "ACTIVITY" },
  PADDLE_KAYAK: {
    isArchived: false,
    value: "PADDLE_KAYAK",
    label: "SUPing / Kayaking",
    isComingSoon: false,
    category: "ACTIVITY",
  },
  HIKING_TRAIL: {
    isArchived: false,
    value: "HIKING_TRAIL",
    label: "Hiking / Trail running",
    isComingSoon: false,
    category: "ACTIVITY",
  },
  YOGA: { isArchived: false, value: "YOGA", label: "Yoga", isComingSoon: true, category: "ACTIVITY" },
  // Services
  GAS_STATION: { isArchived: false, value: "GAS_STATION", label: "Renewable diesel", isComingSoon: false, category: "SERVICE" },
  SAFE_PARKING: { isArchived: false, value: "SAFE_PARKING", label: "Safe parking", isComingSoon: true, category: "SERVICE" },
  ELECTRIC_CHARGE_POINT: {
    isArchived: false,
    value: "ELECTRIC_CHARGE_POINT",
    label: "Electric Charge Point",
    isComingSoon: true,
    category: "SERVICE",
  },
  MECHANIC_PARTS: {
    isArchived: false,
    value: "MECHANIC_PARTS",
    label: "Mechanic / Parts",
    isComingSoon: true,
    category: "SERVICE",
  },
  VET: { isArchived: false, value: "VET", label: "Vet", isComingSoon: true, category: "SERVICE" },
  // Hospitality
  CAFE: { isArchived: false, value: "CAFE", label: "Cafe", isComingSoon: true, category: "HOSPITALITY" },
  RESTAURANT: { isArchived: false, value: "RESTAURANT", label: "Restaurant", isComingSoon: true, category: "HOSPITALITY" },
  BAR: { isArchived: false, value: "BAR", label: "Bar", isComingSoon: true, category: "HOSPITALITY" },
  SHOP: { isArchived: false, value: "SHOP", label: "Shop", isComingSoon: true, category: "HOSPITALITY" },
  // Other
  VOLUNTEERING: { isArchived: false, value: "VOLUNTEERING", label: "Volunteering", isComingSoon: false, category: "OTHER" },
  REWILDING: { isArchived: false, value: "REWILDING", label: "Rewilding", isComingSoon: false, category: "OTHER" },
  NATURE_EDUCATION: {
    isArchived: false,
    value: "NATURE_EDUCATION",
    label: "Nature Education",
    isComingSoon: true,
    category: "OTHER",
  },
  FESTIVAL: { isArchived: false, value: "FESTIVAL", label: "Festival", isComingSoon: true, category: "OTHER" },
  ART_FILM_PHOTOGRAPHY: {
    isArchived: false,
    value: "ART_FILM_PHOTOGRAPHY",
    label: "Art, Film & Photography",
    isComingSoon: true,
    category: "OTHER",
  },
} satisfies Record<SpotType, SpotTypeInfo>

export const SPOT_TYPE_OPTIONS = Object.entries(SPOT_TYPES)
  .map(([_, val]) => val)
  .filter((s) => !s.isArchived)

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
  volunteeringEventsId: true,
  camperguruId: true,
  eFuelsNowId: true,
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
  spot.polskiCaravaningId ||
  spot.camperguruId ||
  spot.volunteeringEventsId ||
  spot.eFuelsNowId

export const partners = {
  campspace: {
    name: "Campspace",
    logo: { light: "/partners/campspace.svg", dark: "/partners/campspace-dark.svg" },
    pretext: "Book a spot on",
  },
  komoot: {
    name: "Komoot",
    logo: { light: "/partners/komoot.svg", dark: "/partners/komoot-dark.svg" },
    pretext: "More info on",
  },
  park4night: {
    name: "Park4Night",
    logo: { light: "/partners/park4night.svg", dark: "/partners/park4night-dark.svg" },
    pretext: "More info on",
  },
  surfline: {
    name: "Surfline",
    logo: { light: "/partners/surfline.svg", dark: "/partners/surfline-dark.svg" },
    pretext: "Check forecast on",
  },
  natuur: {
    name: "Natuurkampeerterrein",
    logo: { light: "/partners/natuur.svg", dark: "/partners/natuur.svg" },
    pretext: "Book a spot on",
  },
  roadsurfer: {
    name: "Roadsurfer",
    logo: { light: "/partners/roadsurfer.svg", dark: "/partners/roadsurfer-dark.svg" },
    pretext: "Book a spot on",
  },
  loodusegakoos: {
    name: "Loodusega koos ",
    logo: { light: "/partners/loodusegakoos.svg", dark: "/partners/loodusegakoos.svg" },
    pretext: "More info on",
  },
  cucortu: {
    name: "Cucortu'",
    logo: { light: "/partners/cucortu.png", dark: "/partners/cucortu-dark.png" },
    pretext: "More info on",
  },
  theCrag: {
    name: "The Crag",
    logo: { light: "/partners/the-crag.svg", dark: "/partners/the-crag-dark.svg" },
    pretext: "More route info on",
  },
  neste: {
    name: "Neste",
    logo: { light: "/partners/neste.png", dark: "/partners/neste.png" },
    pretext: "More info on",
  },
  eFuelsNow: {
    name: "eFuels Now",
    logo: { light: "/partners/efuels-now.png", dark: "/partners/efuels-now.png" },
    pretext: "More info on",
  },
  hipcamp: {
    name: "Hipcamp",
    logo: { light: "/partners/hipcamp.svg", dark: "/partners/hipcamp-dark.svg" },
    pretext: "Book a spot on",
  },
  norcamp: {
    name: "Norcamp",
    logo: { light: "/partners/norcamp.png", dark: "/partners/norcamp.png" },
    pretext: "More info on",
  },
  mossyEarth: {
    name: "Mossy Earth",
    logo: { light: "/partners/mossy-earth.png", dark: "/partners/mossy-earth-dark.png" },
    pretext: "More info on",
  },
  rewildingEurope: {
    name: "Rewilding Europe",
    logo: { light: "/partners/rewilding-europe.png", dark: "/partners/rewilding-europe-dark.png" },
    pretext: "More info on",
  },
  polskiCaravaning: {
    name: "Polski Caravaning",
    logo: { light: "/partners/polski-caravaning.svg", dark: "/partners/polski-caravaning.svg" },
    pretext: "More info on",
  },
  volunteeringEvents: {
    name: "Volunteering Events",
    logo: { light: "/partners/volunteering-events.png", dark: "/partners/volunteering-events-dark.png" },
    pretext: "More info on",
  },
  camperguru: {
    name: "Camperguru",
    logo: { light: "/partners/camperguru.svg", dark: "/partners/camperguru-dark.svg" },
    pretext: "Book a spot on",
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

export const campingSpotTypes = ["CAMPING", "VAN_PARK", "PRIVATE_LAND", "ROADSIDE", "CARPARK"] as SpotType[]

export function isCampingSpot(type?: SpotType | null | undefined) {
  if (!type) return false
  return campingSpotTypes.includes(type)
}

export const activitySpotTypes = ["CLIMBING", "SURFING", "YOGA", "HIKING_TRAIL", "PADDLE_KAYAK", "MOUNTAIN_BIKING"] as SpotType[]

export const spotMarkerColorTypes = {
  // stays
  CAMPING: "border-green-100 bg-green-700",
  VAN_PARK: "border-green-100 bg-green-700",
  PRIVATE_LAND: "border-green-100 bg-green-700",
  ROADSIDE: "border-green-100 bg-green-700",
  CARPARK: "border-green-100 bg-green-700",
  FREE_CAMPING: "border-cyan-100 bg-cyan-800", // deprecated
  // activities
  SURFING: "border-blue-100 bg-blue-500",
  CLIMBING: "border-blue-100 bg-blue-500",
  MOUNTAIN_BIKING: "border-blue-100 bg-blue-500",
  HIKING_TRAIL: "border-blue-100 bg-blue-500",
  PADDLE_KAYAK: "border-blue-100 bg-blue-500",
  YOGA: "border-blue-100 bg-blue-500",
  // services
  SAFE_PARKING: "border-gray-500 bg-gray-50",
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
  VAN_PARK: "text-white",
  PRIVATE_LAND: "text-white",
  ROADSIDE: "text-white",
  CARPARK: "text-white",

  // activities
  SURFING: "text-white",
  CLIMBING: "text-white",
  MOUNTAIN_BIKING: "text-white",
  HIKING_TRAIL: "text-white",
  PADDLE_KAYAK: "text-white",
  YOGA: "text-white",
  // services
  SAFE_PARKING: "text-black",
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
  VAN_PARK: colors.green[700],
  PRIVATE_LAND: colors.green[700],
  ROADSIDE: colors.green[700],
  CARPARK: colors.green[700],
  // activities
  SURFING: colors.blue[500],
  CLIMBING: colors.blue[500],
  MOUNTAIN_BIKING: colors.blue[500],
  HIKING_TRAIL: colors.blue[500],
  PADDLE_KAYAK: colors.blue[500],
  YOGA: colors.blue[500],
  // services
  SAFE_PARKING: colors.gray[50],
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
