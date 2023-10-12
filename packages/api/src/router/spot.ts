import { TRPCError } from "@trpc/server"
import Supercluster from "supercluster"
import { z } from "zod"

import { Prisma, SpotType } from "@ramble/database/types"
import { SpotItemWithStatsAndImage, spotAmenitiesSchema, spotSchemaWithoutType } from "@ramble/shared"

import { generateBlurHash } from "../services/generateBlurHash.server"
import { geocodeCoords } from "../services/geocode.server"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"
import { publicSpotWhereClause, publicSpotWhereClauseRaw } from "../shared/spot.server"
import dayjs from "dayjs"
import { fetchAndJoinSpotImages } from "../lib/models/spot"

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
        isUnverified: z.boolean().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { zoom, types, isUnverified, isPetFriendly, ...coords } = input
      const defaultTypes = [SpotType.CAMPING, SpotType.FREE_CAMPING]
      const spots = await ctx.prisma.spot.findMany({
        select: { id: true, latitude: true, longitude: true, type: true },
        where: {
          ...publicSpotWhereClause(ctx.user?.id),
          verifiedAt: isUnverified ? undefined : { not: { equals: null } },
          isPetFriendly: isPetFriendly ? { equals: true } : undefined,
          latitude: { gt: coords.minLat, lt: coords.maxLat },
          longitude: { gt: coords.minLng, lt: coords.maxLng },
          type: types
            ? typeof types === "string"
              ? { equals: types as SpotType }
              : types.length > 0
              ? { in: types as SpotType[] }
              : { in: defaultTypes }
            : { in: defaultTypes },
        },
        orderBy: { createdAt: "desc" },
        take: 8000,
      })
      if (spots.length === 0) return []
      const supercluster = new Supercluster<{ id: string; type: SpotType; cluster: false }, { cluster: true }>({
        maxZoom: 16,
        radius: !types || typeof types === "string" ? 40 : types.length > 4 ? 60 : 50,
      })
      const clustersData = supercluster.load(
        spots.map((spot) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [spot.longitude, spot.latitude] },
          properties: { id: spot.id, type: spot.type, cluster: false },
        })),
      )
      const clusters = clustersData.getClusters([coords.minLng, coords.minLat, coords.maxLng, coords.maxLat], zoom || 5)
      return clusters.map((c) => ({
        ...c,
        properties: c.properties.cluster
          ? { ...c.properties, zoomLevel: supercluster.getClusterExpansionZoom(c.properties.cluster_id) }
          : c.properties,
      }))
    }),
  verify: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({ where: { id: input.id } })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    if (spot.verifiedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Already verified" })
    return ctx.prisma.spot.update({
      where: { id: input.id },
      data: { verifiedAt: new Date(), verifier: { connect: { id: ctx.user.id } } },
    })
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({ where: { id: input.id } })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    return ctx.prisma.spot.update({ where: { id: input.id }, data: { deletedAt: new Date() } })
  }),
  list: publicProcedure
    .input(z.object({ skip: z.number().optional(), sort: z.enum(["latest", "rated", "saved"]).optional() }))
    .query(async ({ ctx, input }) => {
      const sort = input.sort || "latest"
      const ORDER_BY = Prisma.sql // prepared orderBy
      `ORDER BY
        ${
          sort === "latest"
            ? Prisma.sql`Spot.createdAt DESC, Spot.id`
            : sort === "saved"
            ? Prisma.sql`savedCount DESC, Spot.id`
            : Prisma.sql`rating DESC, Spot.id`
        }
      `
      try {
        const spots = await ctx.prisma.$queryRaw<Array<SpotItemWithStatsAndImage>>`
          SELECT
            Spot.id, Spot.name, Spot.type, Spot.address,  null as image, null as blurHash,
            (SELECT AVG(rating) FROM Review WHERE Review.spotId = Spot.id) AS rating,
            (CAST(COUNT(ListSpot.spotId) as CHAR(32))) AS savedCount
          FROM
            Spot
          LEFT JOIN
            ListSpot ON Spot.id = ListSpot.spotId
          WHERE
            Spot.verifiedAt IS NOT NULL AND ${publicSpotWhereClauseRaw(ctx.user?.id)} AND Spot.type IN (${Prisma.join([
              SpotType.CAMPING,
              SpotType.FREE_CAMPING,
            ])})
          GROUP BY
            Spot.id
          ${ORDER_BY}
          LIMIT 20
          OFFSET ${input.skip || 0}
        `
        await fetchAndJoinSpotImages(ctx.prisma, spots)

        return spots
      } catch (error) {
        console.log(error)
        return []
      }
    }),
  mapPreview: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({
      where: { id: input.id, ...publicSpotWhereClause(ctx.user?.id) },
      select: {
        id: true,
        name: true,
        type: true,
        verifier: true,
        verifiedAt: true,
        _count: { select: { listSpots: true, reviews: true } },
        listSpots: ctx.user ? { where: { list: { creatorId: ctx.user.id } } } : undefined,
        images: true,
      },
    })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    const rating = await ctx.prisma.review.aggregate({ where: { spotId: input.id }, _avg: { rating: true } })
    return { ...spot, rating }
  }),
  detail: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({
      where: { id: input.id, ...publicSpotWhereClause(ctx.user?.id) },
      include: {
        verifier: true,
        creator: true,
        _count: { select: { reviews: true, listSpots: true } },
        reviews: { take: 5, include: { user: true }, orderBy: { createdAt: "desc" } },
        images: true,
        amenities: true,
        listSpots: ctx.user ? { where: { list: { creatorId: ctx.user.id } } } : undefined,
      },
    })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    const rating = await ctx.prisma.review.aggregate({ where: { spotId: input.id }, _avg: { rating: true } })
    return { ...spot, rating }
  }),
  byUser: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { username: input.username } })
    if (!user) throw new TRPCError({ code: "NOT_FOUND" })
    const spots = await ctx.prisma.$queryRaw<SpotItemWithStatsAndImage[]>`
      SELECT
        Spot.id, Spot.name, Spot.type, Spot.address, null as image, null as blurHash,
        (SELECT AVG(rating) FROM Review WHERE Review.spotId = Spot.id) AS rating,
        (CAST(COUNT(ListSpot.spotId) as CHAR(32))) AS savedCount
      FROM
        Spot
      LEFT JOIN
        ListSpot ON Spot.id = ListSpot.spotId
      WHERE
        Spot.creatorId = ${user.id} AND ${publicSpotWhereClauseRaw(user.id)}
      GROUP BY
        Spot.id
      ORDER BY
        Spot.createdAt DESC, Spot.id
      LIMIT 20
    `
    await fetchAndJoinSpotImages(ctx.prisma, spots)
    return spots
  }),
  create: protectedProcedure
    .input(
      spotSchemaWithoutType.extend({
        type: z.nativeEnum(SpotType),
        images: z.array(z.object({ path: z.string() })),
        amenities: spotAmenitiesSchema.partial().optional(),
        shouldPublishLater: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { shouldPublishLater } = input
      const amenities = input.amenities
      const address = await geocodeCoords({ latitude: input.latitude, longitude: input.longitude })
      const imageData = await Promise.all(
        input.images.map(async ({ path }) => {
          const blurHash = await generateBlurHash(path)
          return { path, blurHash, creator: { connect: { id: ctx.user.id } } }
        }),
      )
      const spot = await ctx.prisma.spot.create({
        data: {
          ...input,
          publishedAt: shouldPublishLater ? dayjs().add(2, "weeks").toDate() : undefined,
          address: address || "Unknown address",
          creator: { connect: { id: ctx.user.id } },
          verifiedAt: ctx.user.role === "GUIDE" ? new Date() : null,
          verifier: ctx.user.role === "GUIDE" ? { connect: { id: ctx.user.id } } : undefined,
          images: { create: imageData },
          amenities: amenities ? { create: amenities } : undefined,
        },
      })
      return spot
    }),
  update: protectedProcedure
    .input(
      spotSchemaWithoutType.extend({
        id: z.string(),
        type: z.nativeEnum(SpotType),
        images: z.array(z.object({ path: z.string() })),
        amenities: spotAmenitiesSchema.partial().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const spot = await ctx.prisma.spot.findUnique({ where: { id }, include: { images: true, amenities: true } })
      if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
      const amenities = data.amenities
      const address = await geocodeCoords({ latitude: data.latitude, longitude: data.longitude })

      const imagesToDelete = spot.images.filter((image) => !data.images.find((i) => i.path === image.path))
      const imagesToCreate = data.images.filter((image) => !spot.images.find((i) => i.path === image.path))

      const imageData = await Promise.all(
        imagesToCreate.map(async ({ path }) => {
          const blurHash = await generateBlurHash(path)
          return { path, blurHash, creator: { connect: { id: ctx.user.id } } }
        }),
      )
      return ctx.prisma.spot.update({
        where: { id },
        data: {
          ...data,
          address: address || "Unknown address",
          images: { create: imageData, delete: imagesToDelete },
          amenities: amenities
            ? { update: spot.amenities ? amenities : undefined, create: spot.amenities ? undefined : amenities }
            : { delete: spot.amenities ? true : undefined },
        },
      })
    }),
})
