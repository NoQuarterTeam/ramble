import { TRPCError } from "@trpc/server"
import bbox from "@turf/bbox"
import { lineString } from "@turf/helpers"
import Supercluster from "supercluster"
import { z } from "zod"

import type { SpotType } from "@ramble/database/types"
import { clusterSchema, listSchema, userSchema } from "@ramble/server-schemas"
import {
  publicSpotWhereClauseRaw,
  sendSpotAddedToListNotification,
  spotItemDistanceFromMeField,
  spotItemSelectFields,
} from "@ramble/server-services"
import type { SpotItemType } from "@ramble/shared"

import { waitUntil } from "@vercel/functions"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"
import type { SpotClusterTypes } from "./spot"

export const listRouter = createTRPCRouter({
  allByUser: publicProcedure
    .input(userSchema.pick({ username: true }).and(z.object({ showFollowing: z.boolean().optional() })))
    .query(async ({ ctx, input }) => {
      const currentUser = ctx.user?.username
      const followers =
        ctx.user &&
        input.showFollowing &&
        (await ctx.prisma.user.findUnique({ where: { id: ctx.user.id } }).following({ select: { id: true } }))

      return ctx.prisma.list.findMany({
        orderBy: { createdAt: "desc" },
        where: {
          creator: input.showFollowing && followers ? { id: { in: followers.map((f) => f.id) } } : { username: input.username },
          isPrivate: !currentUser || currentUser !== input.username ? false : undefined,
        },
        include: input.showFollowing
          ? { creator: { select: { avatar: true, avatarBlurHash: true, firstName: true, lastName: true } } }
          : undefined,
      })
    }),
  detail: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const currentUser = ctx.user?.username
    const [list, spots] = await Promise.all([
      ctx.prisma.list.findFirst({
        where: { id: input.id },
        select: {
          id: true,
          creatorId: true,
          isPrivate: true,
          creator: { select: { username: true, firstName: true, lastName: true } },
          name: true,
          description: true,
        },
      }),
      ctx.prisma.$queryRaw<Array<SpotItemType>>`
        SELECT 
          ${spotItemDistanceFromMeField(ctx.user)},
          ${spotItemSelectFields}
        FROM
          Spot
        LEFT JOIN
          ListSpot ON Spot.id = ListSpot.spotId
        LEFT JOIN
          SpotImage ON Spot.coverId = SpotImage.id
        WHERE
          ListSpot.listId = ${input.id} AND ${publicSpotWhereClauseRaw(ctx.user?.id)}
        GROUP BY
          Spot.id
        ORDER BY
          Spot.id
      `,
    ])
    if (!list || (list.isPrivate && (!currentUser || currentUser !== list.creator.username))) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }

    if (spots.length === 0) return { list, spots }

    if (spots.length === 1) return { list, spots, center: [spots[0]?.longitude, spots[0]?.latitude] as [number, number] }
    const spotCoords = spots.map((spot) => [spot.longitude, spot.latitude])

    const line = lineString(spotCoords)
    const bounds = bbox(line) as [number, number, number, number]

    return { list, spots, bounds }
  }),
  spotClusters: publicProcedure
    .input(z.object({ id: z.string() }).and(clusterSchema).optional())
    .query(async ({ ctx, input }) => {
      if (!input) return []
      const { id, zoom, ...coords } = input
      const currentUser = ctx.user?.username

      const list = await ctx.prisma.list.findFirst({
        where: { id },
        select: {
          id: true,
          isPrivate: true,
          creator: { select: { username: true } },
          listSpots: { select: { spot: { select: { id: true, type: true, latitude: true, longitude: true } } } },
        },
      })

      if (!list || (list.isPrivate && (!currentUser || currentUser !== list.creator.username)))
        throw new TRPCError({ code: "NOT_FOUND" })

      const spots = list.listSpots.flatMap((listSpot) => listSpot.spot)

      const supercluster = new Supercluster<{ id: string; type: SpotType; cluster: false }, { cluster: true }>({
        maxZoom: 16,
        radius: 50,
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
  allByUserWithSavedSpots: protectedProcedure.input(z.object({ spotId: z.string() })).query(async ({ ctx, input }) => {
    return ctx.prisma.list.findMany({
      where: { creatorId: ctx.user.id },
      orderBy: { createdAt: "desc" },
      include: { listSpots: { where: { spotId: input.spotId } } },
    })
  }),
  saveToList: protectedProcedure.input(z.object({ spotId: z.string(), listId: z.string() })).mutation(async ({ ctx, input }) => {
    const listSpot = await ctx.prisma.listSpot.findFirst({
      where: { spotId: input.spotId, listId: input.listId },
    })
    if (listSpot) {
      return ctx.prisma.listSpot.delete({ where: { id: listSpot.id } })
    }
    const list = await ctx.prisma.listSpot.create({ data: { spotId: input.spotId, listId: input.listId } })
    waitUntil(sendSpotAddedToListNotification({ spotId: input.spotId, initiatorId: ctx.user.id }))
    return list
  }),
  create: protectedProcedure.input(listSchema).mutation(({ ctx, input }) => {
    return ctx.prisma.list.create({ data: { ...input, creatorId: ctx.user.id } })
  }),
  update: protectedProcedure
    .input(listSchema.partial().extend({ id: z.string() }))
    .mutation(({ ctx, input: { id, ...data } }) => {
      return ctx.prisma.list.update({ where: { id }, data })
    }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
    return ctx.prisma.list.delete({ where: { id: input.id } })
  }),
})
