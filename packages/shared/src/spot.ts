import type { Spot, SpotImage, SpotType, User } from "@ramble/database/types"

export type SpotItemWithStats = Pick<Spot, "id" | "name" | "address" | "type"> & {
  rating: string
  savedCount: string
  image: SpotImage["path"] | null
  blurHash: SpotImage["blurHash"] | null
}

export const canManageSpot = (
  spot: (Pick<Spot, "ownerId"> & { deletedAt: string | Date | null }) | null,
  user: Pick<User, "id" | "isAdmin" | "role" | "isVerified"> | null | undefined,
) => {
  if (!user) return false
  if (!spot) return false
  if (spot.deletedAt) return false
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
