import type { Spot, User } from "@ramble/database/types"

export const canManageSpot = (spot: Pick<Spot, "ownerId"> | null, user: Pick<User, "id" | "role" | "isVerified"> | null) => {
  if (!user) return false
  if (!spot) return false
  if (user.role === "ADMIN") return true
  if (!user.isVerified) return false
  if (user.role === "AMBASSADOR") return true
  if (!spot.ownerId) return false
  if (user.role === "OWNER" && user.id === spot.ownerId) return true
  if (spot.ownerId === user.id) return true
  return false
}
