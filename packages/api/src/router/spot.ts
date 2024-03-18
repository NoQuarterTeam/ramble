import crypto from "node:crypto"
import { TRPCError } from "@trpc/server"
import dayjs from "dayjs"
import Supercluster from "supercluster"
import { z } from "zod"

import { SpotType } from "@ramble/database/types"
import { FULL_WEB_URL } from "@ramble/server-env"
import { clusterSchema, spotAmenitiesSchema, spotSchema, userSchema } from "@ramble/server-schemas"
import {
  deleteManyObjects,
  generateBlurHash,
  geocodeAddress,
  geocodeCoords,
  publicSpotWhereClause,
  publicSpotWhereClauseRaw,
  sendSlackMessage,
  spotItemDistanceFromMeField,
  spotItemSelectFields,
  spotListQuery,
  verifiedSpotWhereClause,
} from "@ramble/server-services"
import { amenitiesFields, promiseHash, spotPartnerFields } from "@ramble/shared"
import type { SpotItemType } from "@ramble/shared"

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
      const supercluster = new Supercluster<{ id: string; type: SpotType; cluster: false }, { cluster: true }>({
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
      try {
        const spots = await ctx.prisma.$queryRaw<Array<SpotItemType>>`
          ${spotListQuery({ user: ctx.user, sort, take: 20, skip: input.skip })}
        `
        return spots
      } catch (error) {
        console.log(error)
        return []
      }
    }),
  mapPreview: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({
      where: { id: input.id, ...publicSpotWhereClause(ctx.user?.id) },
      select: {
        id: true,
        name: true,
        type: true,
        ownerId: true,
        verifier: true, // deprecated
        verifiedAt: true, // deprecated
        creator: true,
        ...spotPartnerFields,
        _count: { select: { listSpots: true, reviews: true } },
        listSpots: ctx.user ? { where: { list: { creatorId: ctx.user.id } } } : undefined,
        coverId: true,
        images: true,
      },
    })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    const rating = await ctx.prisma.review.aggregate({ where: { spotId: input.id }, _avg: { rating: true } })
    spot.images = spot.images.sort((a, b) => (a.id === spot.coverId ? -1 : b.id === spot.coverId ? 1 : 0))
    return { ...spot, rating }
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
    const { spot, rating } = await promiseHash({
      spot: ctx.prisma.spot.findUnique({
        where: { id: input.id, ...publicSpotWhereClause(ctx.user?.id) },
        select: {
          id: true,
          name: true,
          description: true,
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
          creator: true,
          ...spotPartnerFields,
          _count: { select: { reviews: true, listSpots: true } },
          reviews: { take: 5, include: { user: true }, orderBy: { createdAt: "desc" } },
          images: true,
          amenities: { select: amenitiesFields },
          listSpots: ctx.user ? { where: { list: { creatorId: ctx.user.id } } } : undefined,
        },
      }),
      rating: ctx.prisma.review.aggregate({ where: { spotId: input.id }, _avg: { rating: true } }),
    })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    let translatedDescription: string | null | undefined
    let descriptionHash: string | undefined
    if (ctx.user && spot.description) {
      descriptionHash = crypto.createHash("sha1").update(spot.description).digest("hex") as string
      translatedDescription = await fetch(
        `${FULL_WEB_URL}/api/spots/${spot.id}/translate/${ctx.user.preferredLanguage}?hash=${descriptionHash}`,
      )
        .then((r) => r.json() as Promise<string | null>)
        .catch((error) => {
          console.log(error)
          return null
        })
    }
    spot.images = spot.images.sort((a, b) => (a.id === spot.coverId ? -1 : b.id === spot.coverId ? 1 : 0))
    return {
      spot,
      translatedDescription,
      descriptionHash,
      isLiked: !!ctx.user && spot.listSpots.length > 0,
      rating,
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
      const spot = await ctx.prisma.spot.create({
        data: {
          ...data,
          publishedAt: shouldPublishLater ? dayjs().add(2, "weeks").toDate() : undefined,
          creator: { connect: { id: ctx.user.id } },
          images: { create: imageData },
          amenities: amenities ? { create: amenities } : undefined,
        },
      })
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
        await ctx.prisma.tripItem.create({
          data: {
            creator: { connect: { id: ctx.user.id } },
            spot: { connect: { id: spot.id } },
            trip: { connect: { id: tripId } },
            order: newOrder,
          },
        })
      }
      void sendSlackMessage(`📍 New spot added by @${ctx.user.username}!`)
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
              amenities: spotAmenitiesSchema.partial(),
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

      return ctx.prisma.spot.update({
        where: { id },
        data: {
          ...data,
          images: { create: imageData, delete: imagesToDelete },
          amenities: amenities
            ? { update: spot.amenities ? amenities : undefined, create: spot.amenities ? undefined : amenities }
            : { delete: spot.amenities ? true : undefined },
        },
      })
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
  /**
   * @deprecated Use mapbox router now
   */
  geocodeCoords: publicProcedure.input(z.object({ latitude: z.number(), longitude: z.number() })).query(async ({ input }) => {
    const address = await geocodeCoords({ latitude: input.latitude, longitude: input.longitude })
    return address || null
  }),
  /**
   * @deprecated Use mapbox router now
   */
  geocodeAddress: publicProcedure.input(z.object({ address: z.string() })).query(async ({ input }) => {
    const coords = await geocodeAddress({ address: input.address })
    return coords || []
  }),
})
