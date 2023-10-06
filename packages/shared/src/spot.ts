import type { Prisma, Spot, SpotImage, SpotType, User } from "@ramble/database/types"

export const spotPartnerFields = {
  campspaceId: true,
  cucortuId: true,
  komootId: true,
  park4nightId: true,
  loodusegakoosId: true,
  natuurKampeerterreinenId: true,
  roadsurferId: true,
  surflineId: true,
  sourceUrl: true,
} satisfies Prisma.SpotSelect

export type SpotPartnerFields = Pick<Spot, keyof typeof spotPartnerFields>

export const isPartnerSpot = (spot: SpotPartnerFields) =>
  spot.campspaceId ||
  spot.surflineId ||
  spot.komootId ||
  spot.park4nightId ||
  spot.roadsurferId ||
  spot.cucortuId ||
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
