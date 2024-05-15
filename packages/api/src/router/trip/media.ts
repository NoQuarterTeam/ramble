import { clusterSchema, tripMediaSchema } from "@ramble/server-schemas"
import { sendTripMediaAddedNotification } from "@ramble/server-services"
import { promiseHash } from "@ramble/shared"
import { TRPCError } from "@trpc/server"
import bbox from "@turf/bbox"
import { lineString } from "@turf/helpers"
import { waitUntil } from "@vercel/functions"
import Supercluster from "supercluster"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../../trpc"

export const tripMediaRouter = createTRPCRouter({
  clusters: protectedProcedure
    .input(clusterSchema.and(z.object({ tripId: z.string() })).optional())
    .query(async ({ ctx, input }) => {
      if (!input) return []
      const { tripId, ...coords } = input
      const media = await ctx.prisma.tripMedia.findMany({
        where: {
          tripId,
          latitude: { not: null, gt: coords.minLat, lt: coords.maxLat },
          longitude: { not: null, gt: coords.minLng, lt: coords.maxLng },
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, path: true, thumbnailPath: true, longitude: true, latitude: true },
      })
      const supercluster = new Supercluster<
        {
          id: string
          cluster: false
          path: string
          thumbnailPath: string | null
          latitude: number
          longitude: number
        },
        { cluster: true }
      >({ maxZoom: 22 })
      const clustersData = supercluster.load(
        media.map((media) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [media.longitude!, media.latitude!] },
          properties: {
            cluster: false,
            id: media.id,
            path: media.path,
            thumbnailPath: media.thumbnailPath,
            latitude: media.latitude!,
            longitude: media.longitude!,
          },
        })),
      )
      const clusters = clustersData.getClusters([coords.minLng, coords.minLat, coords.maxLng, coords.maxLat], coords.zoom || 5)
      return clusters.map((c) => {
        if (!c.properties.cluster) return { ...c, properties: c.properties }
        const leaves = supercluster.getLeaves(c.properties.cluster_id)
        const line = lineString(leaves.map((l) => [l.properties.longitude, l.properties.latitude]))
        const bounds = bbox(line)
        return {
          ...c,
          properties: { ...c.properties, bounds, media: leaves },
        }
      })
    }),
  byBounds: protectedProcedure
    .input(z.object({ tripId: z.string(), bounds: z.array(z.number()) }).and(z.object({ skip: z.number() })))
    .query(({ ctx, input }) => {
      const [minLng, minLat, maxLng, maxLat] = input.bounds
      return promiseHash({
        total: ctx.prisma.tripMedia.count({
          where: {
            tripId: input.tripId,
            latitude: { gte: minLat, lte: maxLat },
            longitude: { gte: minLng, lte: maxLng },
            deletedAt: null,
          },
        }),
        items: ctx.prisma.tripMedia.findMany({
          orderBy: { timestamp: "desc" },
          take: 30,
          skip: input.skip,
          where: {
            tripId: input.tripId,
            latitude: { gte: minLat, lte: maxLat },
            longitude: { gte: minLng, lte: maxLng },
            deletedAt: null,
          },
        }),
      })
    }),
  all: protectedProcedure.input(z.object({ tripId: z.string() }).and(z.object({ skip: z.number() }))).query(({ ctx, input }) => {
    return promiseHash({
      total: ctx.prisma.tripMedia.count({
        where: { tripId: input.tripId, deletedAt: null, trip: { users: { some: { id: ctx.user.id } } } },
      }),
      items: ctx.prisma.tripMedia.findMany({
        take: 30,
        skip: input.skip,
        orderBy: { timestamp: "desc" },
        select: { id: true, type: true, path: true, latitude: true, longitude: true, duration: true, thumbnailPath: true },
        where: { deletedAt: null, tripId: input.tripId, trip: { users: { some: { id: ctx.user.id } } } },
      }),
    })
  }),
  byId: protectedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.tripMedia.findUnique({ where: { id: input.id, trip: { users: { some: { id: ctx.user.id } } } } })
  }),
  update: protectedProcedure
    .input(tripMediaSchema.partial().and(z.object({ id: z.string() })))
    .mutation(({ ctx, input: { id, ...data } }) => {
      return ctx.prisma.tripMedia.update({ where: { id, trip: { users: { some: { id: ctx.user.id } } } }, data })
    }),
  updateMany: protectedProcedure
    .input(z.object({ tripId: z.string(), ids: z.array(z.string()), data: tripMediaSchema.partial() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.tripMedia.updateMany({
        where: { id: { in: input.ids }, trip: { users: { some: { id: ctx.user.id } } } },
        data: input.data,
      })
      return true
    }),
  upload: protectedProcedure
    .input(
      z.object({
        tripId: z.string(),
        media: tripMediaSchema.optional(),
        /**
         * @deprecated in 1.4.11, use media
         */
        image: tripMediaSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.image && !input.media) throw new TRPCError({ code: "BAD_REQUEST", message: "Media required" })
      const data = input.image || input.media!
      await ctx.prisma.tripMedia.create({ data: { tripId: input.tripId, ...data, creatorId: ctx.user.id } })
      const latestTimestamp = await ctx.prisma.tripMedia.findFirst({
        where: { tripId: input.tripId, deletedAt: null },
        orderBy: { timestamp: "desc" },
        select: { timestamp: true },
      })
      waitUntil(sendTripMediaAddedNotification({ initiatorId: ctx.user.id, tripId: input.tripId, username: ctx.user.username }))
      return latestTimestamp?.timestamp
    }),
  remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.prisma.tripMedia.update({ where: { id: input.id }, data: { deletedAt: new Date() } })
    return true
  }),
  deleteMany: protectedProcedure.input(z.array(z.string())).mutation(async ({ ctx, input }) => {
    await ctx.prisma.tripMedia.updateMany({ where: { id: { in: input } }, data: { deletedAt: new Date() } })
    return true
  }),
})
