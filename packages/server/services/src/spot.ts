import { Prisma } from "@prisma/client"
import type { SpotType, User } from "@ramble/database/types"
import { type SpotListSort, campingSpotTypes } from "@ramble/shared"

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

export const verifiedSpotWhereClause = (userId?: string | null, showUnverified?: boolean | null | undefined) => {
  if (showUnverified) return {}
  if (!userId) return { verifiedAt: { not: { equals: null } } } satisfies Omit<Prisma.SpotWhereUniqueInput, "id">
  return {
    OR: [{ verifiedAt: { equals: null }, creatorId: { equals: userId } }, { verifiedAt: { not: { equals: null } } }],
  } satisfies Omit<Prisma.SpotWhereUniqueInput, "id">
}

export const verifiedSpotWhereClauseRaw = (userId?: string | null, showUnverified?: boolean | null | undefined) => {
  if (showUnverified) return Prisma.sql``
  return userId
    ? Prisma.sql`Spot.verifiedAt IS NOT NULL OR (Spot.creatorId = ${userId} AND Spot.verifiedAt IS NULL)`
    : Prisma.sql`Spot.verifiedAt IS NOT NULL`
}

export const spotItemSelectFields = Prisma.sql`
  Spot.id, Spot.name, Spot.verifiedAt, Spot.type, Spot.address,
  Spot.latitude, Spot.longitude,
  SpotImage.path AS image, SpotImage.blurHash AS blurHash,
  CAST((SELECT AVG(rating) FROM Review WHERE Review.spotId = Spot.id) AS CHAR(32)) AS rating,
  CAST((SELECT COUNT(ListSpot.spotId) FROM ListSpot WHERE ListSpot.spotId = Spot.id) AS CHAR(32)) AS savedCount
`

export const spotItemDistanceFromMeField = (user?: Pick<User, "id" | "latitude" | "longitude"> | null) =>
  user?.latitude && user?.longitude
    ? Prisma.sql`ST_DISTANCE_SPHERE(Spot.pointLocation, POINT(${user.longitude}, ${user.latitude})) * 0.001 as distanceFromMe`
    : Prisma.sql`null as distanceFromMe`

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
  const whereClause = type
    ? Prisma.sql`Spot.verifiedAt IS NOT NULL AND Spot.type = ${type} AND ${publicSpotWhereClauseRaw(user?.id)}`
    : Prisma.sql`Spot.verifiedAt IS NOT NULL AND Spot.type IN (${Prisma.join(campingSpotTypes)}) AND ${publicSpotWhereClauseRaw(user?.id)}`

  const whereWithDistanceSort =
    sort === "near" && user?.latitude && user?.longitude
      ? Prisma.sql`AND Spot.latitude BETWEEN ${user.latitude - 1}
                    AND ${user.latitude + 1}
                    AND Spot.longitude BETWEEN ${user.longitude - 1}
                    AND ${user.longitude + 1}`
      : Prisma.sql``

  const orderByClause = Prisma.sql`${
    sort === "latest"
      ? Prisma.sql`Spot.verifiedAt DESC, Spot.id`
      : sort === "saved"
        ? Prisma.sql`savedCount DESC, Spot.id`
        : sort === "near"
          ? user
            ? Prisma.sql`distanceFromMe ASC, Spot.id`
            : Prisma.sql`Spot.verifiedAt DESC, Spot.id`
          : Prisma.sql`rating DESC, Spot.id`
  }`

  return Prisma.sql`
    SELECT
      ${spotItemDistanceFromMeField(user)},
      ${spotItemSelectFields}
    FROM
      Spot
    LEFT JOIN
      SpotImage ON Spot.coverId = SpotImage.id
    WHERE
      ${whereClause}
      ${whereWithDistanceSort}
    GROUP BY
      Spot.id
    ORDER BY
      ${orderByClause}
    LIMIT ${take}
    OFFSET ${skip || 0}
  `
}
