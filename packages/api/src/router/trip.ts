import { z } from "zod"

import { tripSchema } from "@ramble/server-schemas"

import { createTRPCRouter, protectedProcedure } from "../trpc"

export const tripRouter = createTRPCRouter({
  create: protectedProcedure.input(tripSchema).mutation(({ ctx, input }) => {
    return ctx.prisma.trip.create({ data: { ...input, creatorId: ctx.user.id, users: { connect: { id: ctx.user.id } } } })
  }),
  update: protectedProcedure
    .input(tripSchema.partial().extend({ id: z.string() }))
    .mutation(({ ctx, input: { id, ...data } }) => {
      return ctx.prisma.trip.update({ where: { id }, data })
    }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
    return ctx.prisma.trip.delete({ where: { id: input.id } })
  }),
  detail: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return ctx.prisma.trip.findUnique({ where: { id: input.id } })
  }),
  tripItems: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const tripItems = await ctx.prisma.trip
      .findUnique({ where: { id: input.id } })
      .tripItems({ include: { spot: { include: { images: true } } } })
    return tripItems || []
  }),
  saveToTrip: protectedProcedure.input(z.object({ spotId: z.string(), tripId: z.string() })).mutation(async ({ ctx, input }) => {
    const tripItems = await ctx.prisma.trip
      .findUnique({
        where: { id: input.tripId },
      })
      .tripItems({ where: { spotId: input.spotId } })

    if (tripItems && tripItems.length > 0) {
      return ctx.prisma.tripItem.deleteMany({ where: { tripId: input.tripId, spotId: input.spotId } })
    } else {
      return ctx.prisma.tripItem.create({
        data: { spotId: input.spotId, tripId: input.tripId, creatorId: ctx.user.id },
      })
    }
  }),
  // tripItems: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
  //   return ctx.prisma.trip.findUnique({ where: { id: input.id } }).tripItems({ include: { spot: true } })
  // }),
  // detail: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
  //   const currentUser = ctx.user?.username
  //   const [list, spots] = await Promise.all([
  //     ctx.prisma.list.findFirst({
  //       where: { id: input.id },
  //       select: {
  //         id: true,
  //         creatorId: true,
  //         isPrivate: true,
  //         creator: { select: { username: true, firstName: true, lastName: true } },
  //         name: true,
  //         description: true,
  //       },
  //     }),
  //     ctx.prisma.$queryRaw<Array<SpotItemType>>`
  //       SELECT
  //         ${spotItemDistanceFromMeField(ctx.user)},
  //         ${spotItemSelectFields}
  //       FROM
  //         Spot
  //       LEFT JOIN
  //         ListSpot ON Spot.id = ListSpot.spotId
  //       WHERE
  //         ListSpot.listId = ${input.id} AND ${publicSpotWhereClauseRaw(ctx.user?.id)}
  //       GROUP BY
  //         Spot.id
  //       ORDER BY
  //         Spot.id
  //     `,
  //   ])
  //   if (!list || (list.isPrivate && (!currentUser || currentUser !== list.creator.username)))
  //     throw new TRPCError({ code: "NOT_FOUND" })
  //   await fetchAndJoinSpotImages(ctx.prisma, spots)

  //   if (spots.length === 0) return { list, spots }

  //   if (spots[0]) return { list, spots, center: [spots[0].longitude, spots[0].latitude] as [number, number] }
  //   const spotCoords = spots.map((spot) => [spot.longitude, spot.latitude])

  //   const line = lineString(spotCoords)
  //   const bounds = bbox(line) as [number, number, number, number]

  //   return { list, spots, bounds }
  // }),
  // spotClusters: publicProcedure
  //   .input(z.object({ id: z.string() }).and(clusterSchema))
  //   .query(async ({ ctx, input: { id, zoom, ...coords } }) => {
  //     const currentUser = ctx.user?.username

  //     const list = await ctx.prisma.list.findFirst({
  //       where: { id },
  //       select: {
  //         id: true,
  //         isPrivate: true,
  //         creator: { select: { username: true } },
  //         listSpots: { select: { spot: { select: { id: true, type: true, latitude: true, longitude: true } } } },
  //       },
  //     })

  //     if (!list || (list.isPrivate && (!currentUser || currentUser !== list.creator.username)))
  //       throw new TRPCError({ code: "NOT_FOUND" })

  //     const spots = list.listSpots.flatMap((listSpot) => listSpot.spot)

  //     const supercluster = new Supercluster<{ id: string; type: SpotType; cluster: false }, { cluster: true }>({
  //       maxZoom: 16,
  //       radius: 50,
  //     })
  //     const clustersData = supercluster.load(
  //       spots.map((spot) => ({
  //         type: "Feature",
  //         geometry: { type: "Point", coordinates: [spot.longitude, spot.latitude] },
  //         properties: { id: spot.id, type: spot.type, cluster: false },
  //       })),
  //     )
  //     const clusters = clustersData.getClusters([coords.minLng, coords.minLat, coords.maxLng, coords.maxLat], zoom || 5)
  //     return clusters.map((c) => ({
  //       ...c,
  //       properties: c.properties.cluster
  //         ? {
  //             ...c.properties,
  //             types: supercluster.getLeaves(c.properties.cluster_id).reduce<SpotClusterTypes>((acc, spot) => {
  //               acc[spot.properties.type] = (acc[spot.properties.type] || 0) + 1
  //               return acc
  //             }, {}),
  //             zoomLevel: supercluster.getClusterExpansionZoom(c.properties.cluster_id),
  //           }
  //         : c.properties,
  //     }))
  //   }),
  // allByUserWithSavedSpots: protectedProcedure.input(z.object({ spotId: z.string() })).query(async ({ ctx, input }) => {
  //   return ctx.prisma.list.findMany({
  //     where: { creatorId: ctx.user.id },
  //     orderBy: { createdAt: "desc" },
  //     include: { listSpots: { where: { spotId: input.spotId } } },
  //   })
  // }),
  // saveToList: protectedProcedure.input(z.object({ spotId: z.string(), listId: z.string() })).mutation(async ({ ctx, input }) => {
  //   const listSpot = await ctx.prisma.listSpot.findFirst({
  //     where: { spotId: input.spotId, listId: input.listId },
  //   })
  //   if (listSpot) {
  //     return ctx.prisma.listSpot.delete({ where: { id: listSpot.id } })
  //   } else {
  //     return ctx.prisma.listSpot.create({ data: { spotId: input.spotId, listId: input.listId } })
  //   }
  // }),
})
