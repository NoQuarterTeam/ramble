import { type Spot, SpotType } from "@ramble/database/server"
import { clusterSchema, spotAmenitiesSchema, spotSchema, userSchema } from "@ramble/server-schemas"
import {
  COUNTRIES,
  generateBlurHash,
  geocodeCoords,
  get5DayForecast,
  getCurrentWeather,
  getLanguage,
  publicSpotWhereClause,
  publicSpotWhereClauseRaw,
  sendSlackMessage,
  spotItemDistanceFromMeField,
  spotItemSelectFields,
  spotListQuery,
  updateLoopsContact,
  verifiedSpotWhereClause,
} from "@ramble/server-services"
import type { SpotItemType } from "@ramble/shared"
import { amenitiesFields, promiseHash, spotPartnerFields } from "@ramble/shared"
import { TRPCError } from "@trpc/server"
import dayjs from "dayjs"
import Supercluster from "supercluster"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export type SpotClusterTypes = { [key in SpotType]?: number }

export const spotRouter = createTRPCRouter({
  clusters: publicProcedure
    .input(
      z
        .object({
          types: z.array(z.nativeEnum(SpotType)).or(z.nativeEnum(SpotType)).optional(),
          isPetFriendly: z.boolean().nullish(),
          isUnverified: z.boolean().nullish(),
        })
        .and(clusterSchema)
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      if (!input) return []
      const { zoom, types, isUnverified, isPetFriendly, ...coords } = input
      if (!types || types.length === 0) return []
      const spots = await ctx.prisma.spot.findMany({
        select: { id: true, latitude: true, longitude: true, type: true },
        where: {
          type: typeof types === "string" ? { equals: types } : { in: types },
          ...verifiedSpotWhereClause(ctx.user?.id, isUnverified),
          latitude: { gt: coords.minLat, lt: coords.maxLat },
          longitude: { gt: coords.minLng, lt: coords.maxLng },
          // if isUnverified is pass return all spots, if not, return all spots that are verified or ones created by me
          ...publicSpotWhereClause(ctx.user?.id),
          isPetFriendly: isPetFriendly ? { equals: true } : undefined,
        },
        orderBy: { verifiedAt: "desc" },
        take: 8000,
      })
      if (spots.length === 0) return []
      const supercluster = new Supercluster<
        { cluster: false } & Pick<Spot, "id" | "type">,
        { cluster: true; types: SpotClusterTypes }
      >({
        maxZoom: 16,
        minPoints: 8,
        radius: !types || typeof types === "string" ? 30 : types.length > 4 ? 60 : 40,
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
          ? {
              ...c.properties,
              types: supercluster.getLeaves(c.properties.cluster_id).reduce<SpotClusterTypes>((acc, spot) => {
                acc[spot.properties.type] = (acc[spot.properties.type] || 0) + 1
                return acc
              }, {}),
              zoomLevel: supercluster.getClusterExpansionZoom(c.properties.cluster_id),
            }
          : c.properties,
      }))
    }),
  byNanoid: publicProcedure.input(z.object({ nanoid: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.spot.findUnique({
      where: { nanoid: input.nanoid },
      select: { id: true },
    })
  }),
  verify: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({ where: { id: input.id } })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    if (spot.verifiedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Already verified" })
    return ctx.prisma.spot.update({
      where: { id: input.id },
      data: { verifiedAt: new Date(), verifier: { connect: { id: ctx.user.id } } },
    })
  }),
  delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({ where: { id: input.id } })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    return ctx.prisma.spot.update({ where: { id: input.id }, data: { deletedAt: new Date() } })
  }),
  list: publicProcedure
    .input(z.object({ skip: z.number().optional(), sort: z.enum(["latest", "rated", "saved", "near"]).optional() }))
    .query(async ({ ctx, input }) => {
      const sort = input.sort || "latest"
      const spots = await ctx.prisma.$queryRaw<Array<SpotItemType>>`
          ${spotListQuery({ user: ctx.user, sort, take: 20, skip: input.skip })}
        `
      return spots
    }),
  mapPreview: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({
      where: { id: input.id, ...publicSpotWhereClause(ctx.user?.id) },
      select: {
        id: true,
        name: true,
        type: true,
        latitude: true,
        longitude: true,
        ownerId: true,
        creator: true,
        createdAt: true,
        ...spotPartnerFields,
        _count: { select: { listSpots: true, reviews: true } },
        listSpots: ctx.user ? { where: { list: { creatorId: ctx.user.id } } } : undefined,
        coverId: true,
        images: {
          select: {
            id: true,
            path: true,
            blurHash: true,
            createdAt: true,
            creator: { select: { id: true, username: true, avatar: true, avatarBlurHash: true, deletedAt: true } },
          },
        },
      },
    })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    const sameLocationSpots = await ctx.prisma.spot.findMany({
      where: { ...publicSpotWhereClause(null), latitude: spot.latitude, longitude: spot.longitude },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    })
    const weather = await getCurrentWeather(spot.latitude, spot.longitude)
    const rating = await ctx.prisma.review.aggregate({ where: { spotId: input.id }, _avg: { rating: true } })
    spot.images = spot.images.sort((a, b) => (a.id === spot.coverId ? -1 : b.id === spot.coverId ? 1 : 0))
    return { ...spot, rating, weather, sameLocationSpots }
  }),
  report: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({
      where: { id: input.id, ...publicSpotWhereClause(ctx.user?.id) },
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        isPetFriendly: true,
        latitude: true,
        longitude: true,
        images: true,
        amenities: { select: amenitiesFields },
      },
    })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    return spot
  }),
  detail: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const { spot, rating, tags } = await promiseHash({
      spot: ctx.prisma.spot.findUnique({
        where: { id: input.id, ...publicSpotWhereClause(ctx.user?.id) },
        select: {
          id: true,
          name: true,
          description: true,
          nanoid: true,
          descriptionLanguage: true,
          latitude: true,
          longitude: true,
          coverId: true,
          createdAt: true,
          verifiedAt: true,
          type: true,
          isPetFriendly: true,
          ownerId: true,
          address: true,
          verifier: true,
          creatorId: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              avatarBlurHash: true,
              username: true,
              deletedAt: true,
            },
          },
          ...spotPartnerFields,
          _count: { select: { reviews: true, listSpots: true } },
          reviews: {
            take: 5,
            include: {
              user: { select: { id: true, username: true, avatar: true, avatarBlurHash: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: "desc" },
          },
          images: {
            select: {
              id: true,
              path: true,
              blurHash: true,
              createdAt: true,
              creator: { select: { id: true, username: true, avatar: true, avatarBlurHash: true, deletedAt: true } },
            },
          },
          amenities: { select: amenitiesFields },
          listSpots: ctx.user ? { where: { list: { creatorId: ctx.user.id } } } : undefined,
        },
      }),
      rating: ctx.prisma.review.aggregate({ where: { spotId: input.id }, _avg: { rating: true } }),
      tags: ctx.prisma.$queryRaw<Array<{ name: string; count: string }>>`
        SELECT
          Tag.name,
          CAST(COUNT(*) AS CHAR(32)) AS count
        FROM
          Tag
          LEFT JOIN _ReviewToTag AS rt ON Tag.id = rt.B
          LEFT JOIN Review ON Review.id = rt.A
        WHERE
          Review.spotId = ${input.id}
        GROUP BY
          Tag.name
        ORDER BY
	        count DESC;
      `,
    })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })

    const weather = await get5DayForecast(spot.latitude, spot.longitude)
    spot.images = spot.images.sort((a, b) => (a.id === spot.coverId ? -1 : b.id === spot.coverId ? 1 : 0))
    return {
      spot,
      translatedDescription: spot.description, // @deprecated translate description on client
      isLiked: !!ctx.user && spot.listSpots.length > 0,
      rating,
      tags,
      weather,
    }
  }),
  byUser: publicProcedure.input(userSchema.pick({ username: true })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { username: input.username } })
    if (!user) throw new TRPCError({ code: "NOT_FOUND" })
    const spots = await ctx.prisma.$queryRaw<SpotItemType[]>`
      SELECT
        ${spotItemDistanceFromMeField(ctx.user)},
        ${spotItemSelectFields}
      FROM
        Spot
      LEFT JOIN
        SpotImage ON Spot.coverId = SpotImage.id
      WHERE
        Spot.creatorId = ${user.id} AND Spot.verifiedAt IS NOT NULL AND ${publicSpotWhereClauseRaw(user.id)} AND Spot.sourceUrl IS NULL
      GROUP BY
        Spot.id
      ORDER BY
        Spot.createdAt DESC, Spot.id
      LIMIT 20
    `
    return spots
  }),
  create: protectedProcedure
    .input(
      spotSchema.and(
        z
          .object({
            type: z.nativeEnum(SpotType),
            images: z.array(z.object({ path: z.string() })),
            amenities: spotAmenitiesSchema.partial().nullish(),
            coverImage: z.string().optional(),
            shouldPublishLater: z.boolean().optional(),
            googlePlaceId: z.string().optional(),
          })
          .and(z.object({ tripId: z.string(), order: z.number().optional() }).partial()),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const { shouldPublishLater, tripId, order, amenities, coverImage, images, ...data } = input

      const imageData = await Promise.all(
        images.map(async ({ path }) => {
          const blurHash = await generateBlurHash(path)
          return { path, blurHash, creator: { connect: { id: ctx.user.id } } }
        }),
      )
      let descriptionLanguage = undefined
      if (input.description) {
        descriptionLanguage = await getLanguage(input.description)
      }
      const spot = await ctx.prisma.spot.create({
        data: {
          ...data,
          descriptionLanguage,
          // temp until apps send correct data
          isPetFriendly: data.isPetFriendly === "true" || data.isPetFriendly === true,
          publishedAt: shouldPublishLater ? dayjs().add(2, "weeks").toDate() : undefined,
          creator: { connect: { id: ctx.user.id } },
          images: { create: imageData },
          amenities: amenities ? { create: amenities } : undefined,
        },
      })
      updateLoopsContact({ email: ctx.user.email, hasCreatedSpot: true })
      if (coverImage || imageData?.[0]?.path) {
        await ctx.prisma.spot.update({
          where: { id: spot.id },
          data: { cover: { connect: { spotId_path: { spotId: spot.id, path: coverImage || imageData[0]?.path! } } } },
        })
      }
      if (tripId) {
        let newOrder = order
        if (!order) {
          const tripItems = await ctx.prisma.trip.findUnique({ where: { id: tripId } }).items()
          newOrder = tripItems?.length || 0
        }

        const data = await geocodeCoords({ latitude: spot.latitude, longitude: spot.longitude })
        const countryCode =
          data.country && COUNTRIES.find((c) => c.name === data.country || c.alternatives?.includes(data.country!))?.code

        await ctx.prisma.tripItem.create({
          data: {
            creator: { connect: { id: ctx.user.id } },
            spot: { connect: { id: spot.id } },
            trip: { connect: { id: tripId } },
            order: newOrder,
            countryCode,
          },
        })
      }
      sendSlackMessage(`📍 New spot added by @${ctx.user.username}!`)
      return spot
    }),
  images: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({ where: { id: input.id }, select: { id: true, coverId: true, images: true } })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    return spot
  }),
  update: protectedProcedure
    .input(
      z
        .object({ id: z.string().uuid() })
        .and(spotSchema.partial())
        .and(
          z
            .object({
              coverId: z.string(),
              images: z.array(z.object({ path: z.string() })),
              amenities: spotAmenitiesSchema.partial().nullish(),
            })
            .partial(),
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const spot = await ctx.prisma.spot.findUnique({ where: { id }, include: { images: true, amenities: true } })
      if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
      const amenities = data.amenities

      let imagesToDelete = undefined
      let imageData = undefined
      if (data.images) {
        imagesToDelete = spot.images.filter((image) => !data.images!.find((i) => i.path === image.path))
        const imagesToCreate = data.images.filter((image) => !spot.images.find((i) => i.path === image.path))

        imageData = await Promise.all(
          imagesToCreate.map(async ({ path }) => {
            const blurHash = await generateBlurHash(path)
            return { path, blurHash, creator: { connect: { id: ctx.user.id } } }
          }),
        )
      }
      // await deleteManyObjects(imagesToDelete.map((i) => i.path))
      let descriptionLanguage = spot.descriptionLanguage
      if (!descriptionLanguage) {
        descriptionLanguage = await getLanguage(input.description)
      }
      return ctx.prisma.spot.update({
        where: { id },
        data: {
          ...data,
          descriptionLanguage,
          // temp until apps send correct data
          isPetFriendly: data.isPetFriendly === "true" || data.isPetFriendly === true,
          images: { create: imageData, delete: imagesToDelete },
          amenities: amenities
            ? { update: spot.amenities ? amenities : undefined, create: spot.amenities ? undefined : amenities }
            : { delete: spot.amenities ? true : undefined },
        },
      })
    }),
  findNearby: protectedProcedure
    .input(z.object({ latitude: z.number(), longitude: z.number() }))
    .query(async ({ input, ctx }) => {
      const fiveHundredMeters = 0.0045
      const spots = await ctx.prisma.spot.findMany({
        where: {
          latitude: { gte: input.latitude - fiveHundredMeters, lte: input.latitude + fiveHundredMeters },
          longitude: { gte: input.longitude - fiveHundredMeters, lte: input.longitude + fiveHundredMeters },
        },
        take: 50,
      })
      return spots
    }),
  addImages: protectedProcedure
    .input(z.object({ id: z.string().uuid(), images: z.array(z.object({ path: z.string() })) }))
    .mutation(async ({ ctx, input }) => {
      const { id, images } = input
      const spot = await ctx.prisma.spot.findUnique({ where: { id }, include: { images: true } })
      if (!spot) throw new TRPCError({ code: "NOT_FOUND" })

      const imageData = await Promise.all(
        images.map(async ({ path }) => {
          const blurHash = await generateBlurHash(path)
          return { path, blurHash, creator: { connect: { id: ctx.user.id } } }
        }),
      )
      return ctx.prisma.spot.update({ where: { id }, data: { images: { create: imageData } } })
    }),
})
