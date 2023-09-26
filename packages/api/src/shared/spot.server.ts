import { Prisma, SpotImage } from "@ramble/database/types"
import { SpotItemWithStatsAndImage } from "@ramble/shared"

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

export type LatestSpotImages = Array<Pick<SpotImage, "path" | "blurHash" | "spotId">>
export const spotImagesRawQuery = (ids: string[]) => {
  return Prisma.sql`
    SELECT
      Spot.id as spotId,
      (SELECT path FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY SpotImage.createdAt DESC LIMIT 1) AS path,
      (SELECT blurHash FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY SpotImage.createdAt DESC LIMIT 1) AS blurHash
    FROM
      Spot
    WHERE
      Spot.id IN (${Prisma.join(ids)})
  `
}

export const joinSpotImages = (
  spots: Array<SpotItemWithStatsAndImage>,
  images: Array<Pick<SpotImage, "spotId" | "path" | "blurHash">>,
) => {
  spots.forEach((spot) => {
    const image = images.find((i) => i.spotId === spot.id)
    spot.blurHash = image?.blurHash || null
    spot.image = image?.path || null
  })
}
