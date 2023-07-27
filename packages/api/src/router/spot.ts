import { TRPCError } from "@trpc/server"
import Supercluster from "supercluster"
import { z } from "zod"

import { type Spot, type SpotImage, SpotType } from "@ramble/database/types"
import { spotAmenitiesSchema, spotSchemaWithoutType } from "@ramble/shared"

import { generateBlurHash } from "../services/createBlurHash.server"
import { geocodeCoords } from "../services/geocode.server"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export type SpotItemWithImageAndRating = Pick<Spot, "id" | "name" | "address"> & {
  rating?: number
  image?: SpotImage["path"] | null
  blurHash?: SpotImage["blurHash"] | null
}

export const spotRouter = createTRPCRouter({
  clusters: publicProcedure
    .input(
      z.object({
        zoom: z.number(),
        minLat: z.number(),
        maxLat: z.number(),
        minLng: z.number(),
        maxLng: z.number(),
        types: z.array(z.string()).or(z.string()).optional(),
        isPetFriendly: z.boolean().nullish(),
        isVerified: z.boolean().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { zoom, types, isVerified, isPetFriendly, ...coords } = input
      const spots = await ctx.prisma.spot.findMany({
        select: { id: true, latitude: true, longitude: true, type: true },
        where: {
          verifiedAt: isVerified ? { not: { equals: null } } : undefined,
          isPetFriendly: isPetFriendly ? { equals: true } : undefined,
          latitude: { gt: coords.minLat, lt: coords.maxLat },
          longitude: { gt: coords.minLng, lt: coords.maxLng },
          type: types
            ? typeof types === "string"
              ? { equals: types as SpotType }
              : types.length > 0
              ? { in: types as SpotType[] }
              : undefined
            : undefined,
        },
        orderBy: { createdAt: "desc" },
      })
      if (spots.length === 0) return []
      const supercluster = new Supercluster()
      const clusters = supercluster.load(
        spots.map((spot) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [spot.longitude, spot.latitude] },
          properties: { id: spot.id, type: spot.type },
        })),
      )
      return clusters.getClusters([coords.minLng, coords.minLat, coords.maxLng, coords.maxLat], zoom || 5)
    }),
  latest: publicProcedure.input(z.object({ skip: z.number().optional() })).query(
    async ({ ctx, input }) =>
      ctx.prisma.$queryRaw<Array<SpotItemWithImageAndRating>>`
        SELECT
          Spot.id, Spot.name, Spot.address, AVG(Review.rating) as rating,
          (SELECT path FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS image,
          (SELECT blurHash FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS blurHash
        FROM
          Spot
        LEFT JOIN
          Review ON Spot.id = Review.spotId
        GROUP BY
          Spot.id
        ORDER BY
          Spot.createdAt DESC, Spot.id
        LIMIT 20
        OFFSET ${input.skip || 0}
      `,
  ),
  mapPreview: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({
      where: { id: input.id },
      include: { verifier: true, _count: { select: { reviews: true } }, images: true },
    })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    const rating = await ctx.prisma.review.aggregate({ where: { spotId: input.id }, _avg: { rating: true } })
    return { ...spot, rating }
  }),
  detail: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({
      where: { id: input.id },
      include: {
        verifier: true,
        _count: { select: { reviews: true } },
        reviews: { take: 5, include: { user: true }, orderBy: { createdAt: "desc" } },
        images: true,
        amenities: true,
        spotLists: ctx.user ? { where: { list: { creatorId: ctx.user.id } } } : undefined,
      },
    })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    const rating = await ctx.prisma.review.aggregate({ where: { spotId: input.id }, _avg: { rating: true } })
    return { ...spot, rating }
  }),
  byUser: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
    const res: Array<SpotItemWithImageAndRating> = await ctx.prisma.$queryRaw`
      SELECT
        Spot.id, Spot.name, Spot.address, AVG(Review.rating) as rating,
        (SELECT path FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS image, 
        (SELECT blurHash FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS blurHash
      FROM
        Spot
      LEFT JOIN
        Review ON Spot.id = Review.spotId
      WHERE
        Spot.creatorId = (SELECT id FROM User WHERE username = ${input.username})
      GROUP BY
        Spot.id
      ORDER BY
        Spot.createdAt DESC, Spot.id
      LIMIT 20`
    return res
  }),
  create: protectedProcedure
    .input(
      spotSchemaWithoutType.extend({
        type: z.nativeEnum(SpotType),
        images: z.array(z.object({ path: z.string() })),
        amenities: spotAmenitiesSchema.partial().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const amenities = input.amenities
      let address = input.address
      if (!address) {
        address = await geocodeCoords({ latitude: input.latitude, longitude: input.longitude })
      }
      const imageData = await Promise.all(
        input.images.map(async ({ path }) => {
          const blurHash = await generateBlurHash(path)
          return { path, blurHash, creator: { connect: { id: ctx.user.id } } }
        }),
      )
      const spot = await ctx.prisma.spot.create({
        data: {
          ...input,
          address: address || "Unknown address",
          creator: { connect: { id: ctx.user.id } },
          verifiedAt: ctx.user.role === "GUIDE" ? new Date() : null,
          verifier: ctx.user.role === "GUIDE" ? { connect: { id: ctx.user.id } } : undefined,
          images: { create: imageData },
          amenities: amenities
            ? {
                create: {
                  hotWater: !!amenities.hotWater,
                  wifi: !!amenities.wifi,
                  shower: !!amenities.shower,
                  toilet: !!amenities.toilet,
                  kitchen: !!amenities.kitchen,
                  electricity: !!amenities.electricity,
                  water: !!amenities.water,
                  firePit: !!amenities.firePit,
                  sauna: !!amenities.sauna,
                  pool: !!amenities.pool,
                  bbq: !!amenities.bbq,
                },
              }
            : undefined,
        },
      })
      return spot
    }),
})
