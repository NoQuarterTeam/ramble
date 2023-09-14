import { Prisma } from "@ramble/database/types"

export const publicSpotWhereClause = (userId?: string | null) => {
  return {
    deletedAt: { equals: null },
    AND: userId
      ? { OR: [{ creatorId: { equals: userId } }, { OR: [{ publishedAt: null }, { publishedAt: { lt: new Date() } }] }] }
      : { OR: [{ publishedAt: null }, { publishedAt: { lt: new Date() } }] },
  } satisfies Omit<Prisma.SpotWhereUniqueInput, "id">
}
export const publicSpotWhereClauseRaw = (userId?: string | null) => {
  return userId
    ? Prisma.sql`Spot.deletedAt IS NULL AND (Spot.creatorId = ${userId} OR (Spot.publishedAt IS NULL OR Spot.publishedAt < NOW()))`
    : Prisma.sql`Spot.deletedAt IS NULL AND (Spot.publishedAt IS NULL OR Spot.publishedAt < NOW())`
}
