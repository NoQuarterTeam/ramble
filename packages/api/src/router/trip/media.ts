import { z } from "zod"

import { clusterSchema } from "@ramble/server-schemas"
import bbox from "@turf/bbox"
import { lineString } from "@turf/helpers"
import Supercluster from "supercluster"
import { createTRPCRouter, protectedProcedure } from "../../trpc"

export const mediaRouter = createTRPCRouter({
  clusters: protectedProcedure
    .input(clusterSchema.and(z.object({ tripId: z.string() })).optional())
    .query(async ({ ctx, input }) => {
      if (!input) return []
      const { tripId, ...coords } = input
      const media = await ctx.prisma.tripMedia.findMany({
        where: {
          tripId,
          latitude: { gt: coords.minLat, lt: coords.maxLat },
          longitude: { gt: coords.minLng, lt: coords.maxLng },
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, path: true, longitude: true, latitude: true },
      })
      const supercluster = new Supercluster<
        { id: string; cluster: false; path: string; latitude: number; longitude: number },
        { cluster: true }
      >({ maxZoom: 22 })
      const clustersData = supercluster.load(
        media.map((media) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [media.longitude!, media.latitude!] },
          properties: { cluster: false, id: media.id, path: media.path, latitude: media.latitude, longitude: media.longitude },
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
    .input(z.object({ bounds: z.array(z.number()) }).and(z.object({ skip: z.number() })))
    .query(({ ctx, input }) => {
      const [minLng, minLat, maxLng, maxLat] = input.bounds
      return ctx.prisma.tripMedia.findMany({
        orderBy: { timestamp: "desc" },
        take: 30,
        skip: input.skip,
        where: {
          latitude: { gte: minLat, lte: maxLat },
          longitude: { gte: minLng, lte: maxLng },
          deletedAt: null,
        },
      })
    }),
  all: protectedProcedure.input(z.object({ tripId: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.tripMedia.findMany({
      take: 30,
      where: { tripId: input.tripId, trip: { users: { some: { id: ctx.user.id } } } },
    })
  }),
  byId: protectedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.tripMedia.findUnique({ where: { id: input.id, trip: { users: { some: { id: ctx.user.id } } } } })
  }),
  update: protectedProcedure
    .input(z.object({ id: z.string(), note: z.string().optional() }))
    .mutation(({ ctx, input: { id, ...data } }) => {
      return ctx.prisma.tripMedia.update({ where: { id, trip: { users: { some: { id: ctx.user.id } } } }, data })
    }),
  upload: protectedProcedure
    .input(
      z.object({
        tripId: z.string(),
        image: z.object({
          path: z.string(),
          latitude: z.number(),
          longitude: z.number(),
          assetId: z.string(),
          timestamp: z.date(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.tripMedia.create({
        data: { tripId: input.tripId, ...input.image, creatorId: ctx.user.id },
      })
      return input.image.timestamp
    }),
  remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.prisma.tripMedia.update({ where: { id: input.id }, data: { deletedAt: new Date() } })
    return true
  }),
})
