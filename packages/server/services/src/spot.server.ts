import { Prisma, type User, type SpotImage, SpotType } from "@ramble/database/types"
import { SpotItemWithStatsAndImage, SpotListSort } from "@ramble/shared"

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

export const spotListQuery = ({
  user,
  sort,
  take,
  type,
  skip,
}: {
  user?: Pick<User, "id" | "latitude" | "longitude"> | null
  sort: SpotListSort
  take: number
  skip?: number
  type?: SpotType
}) => {
  const WHERE = type
    ? Prisma.sql`WHERE Spot.verifiedAt IS NOT NULL AND Spot.type = ${type} AND ${publicSpotWhereClauseRaw(user?.id)}`
    : Prisma.sql`WHERE Spot.verifiedAt IS NOT NULL AND Spot.type IN (${Prisma.join([
        SpotType.CAMPING,
        SpotType.FREE_CAMPING,
      ])}) AND ${publicSpotWhereClauseRaw(user?.id)} `

  const DISTANCE_FROM_ME =
    user?.latitude && user?.longitude
      ? Prisma.sql`ST_DISTANCE(Spot.pointLocation, POINT("${user.longitude}", "${user.latitude}")) as distanceFromMe,`
      : Prisma.sql`null as distanceFromMe,`

  const ORDER_BY = Prisma.sql`ORDER BY
    ${
      sort === "latest"
        ? Prisma.sql`Spot.verifiedAt DESC, Spot.id`
        : sort === "saved"
          ? Prisma.sql`savedCount DESC, Spot.id`
          : sort === "near"
            ? Prisma.sql`distanceFromMe ASC, Spot.id`
            : Prisma.sql`rating DESC, Spot.id`
    }`

  return Prisma.sql`
    SELECT 
      Spot.id, Spot.name, Spot.type, Spot.address, null as image, null as blurHash,
      Spot.latitude, Spot.longitude,
      ${DISTANCE_FROM_ME}
      (SELECT AVG(rating) FROM Review WHERE Review.spotId = Spot.id) AS rating,
      CAST((SELECT COUNT(ListSpot.spotId) FROM ListSpot WHERE ListSpot.spotId = Spot.id) AS CHAR(32)) AS savedCount
    FROM
      Spot
    ${WHERE}
    GROUP BY
      Spot.id
    ${ORDER_BY}
    LIMIT ${take}
    OFFSET ${skip || 0}
  `
}
