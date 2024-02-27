import { z } from "zod"

import { tripSchema, tripStopSchema } from "@ramble/server-schemas"

import { getPlaceUnsplashImage } from "@ramble/server-services"
import { TRPCError } from "@trpc/server"
import bbox from "@turf/bbox"
import { lineString } from "@turf/helpers"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const tripRouter = createTRPCRouter({
  mine: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.trip.findMany({
      where: { users: { some: { id: ctx.user.id } } },
      orderBy: { startDate: "desc" },
      include: { items: true, creator: true, users: true },
      take: 20, // TODO pagination
    })
  }),
  active: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.trip.findFirst({
      where: { startDate: { lt: new Date() }, endDate: { gt: new Date() }, users: { some: { id: ctx.user.id } } },
      orderBy: { startDate: "desc" },
      include: { items: true, creator: true, users: true },
    })
  }),
  create: protectedProcedure.input(tripSchema).mutation(async ({ ctx, input }) => {
    // check if start date is before end date
    if (input.startDate > input.endDate) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Start date must be before end date" })
    }
    // check if any trips overlap with the new trip
    const overlappingTrip = await ctx.prisma.trip.findFirst({
      where: {
        users: { some: { id: ctx.user.id } },
        OR: [
          { startDate: { lte: input.startDate }, endDate: { gte: input.startDate } },
          { startDate: { lte: input.endDate }, endDate: { gte: input.endDate } },
        ],
      },
    })
    if (overlappingTrip) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `Trip dates overlaps with "${overlappingTrip.name}"` })
    }
    return ctx.prisma.trip.create({ data: { ...input, creatorId: ctx.user.id, users: { connect: { id: ctx.user.id } } } })
  }),
  update: protectedProcedure
    .input(tripSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input: { id, ...data } }) => {
      const trip = await ctx.prisma.trip.findFirst({ where: { id, users: { some: { id: { equals: ctx.user.id } } } } })
      if (!trip) throw new TRPCError({ code: "NOT_FOUND", message: "Trip not found" })
      if (data.startDate || data.endDate) {
        const startDate = data.startDate || trip.startDate
        const endDate = data.endDate || trip.endDate
        // check if start date is before end date
        if (startDate > endDate) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Start date must be before end date" })
        }
        // check if any trips overlap with the new trip
        const overlappingTrip = await ctx.prisma.trip.findFirst({
          where: {
            id: { not: id },
            users: { some: { id: ctx.user.id } },
            OR: [
              { startDate: { lte: startDate }, endDate: { gte: startDate } },
              { startDate: { lte: endDate }, endDate: { gte: endDate } },
            ],
          },
        })
        if (overlappingTrip) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Trip dates overlaps with "${overlappingTrip.name}"` })
        }
      }
      return ctx.prisma.trip.update({ where: { id }, data })
    }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.prisma.$transaction(async (tx) => {
      const tripItems = await tx.tripItem.findMany({
        where: { tripId: input.id },
        select: { id: true, stop: { select: { id: true } } },
      })
      const tripStopItemIds = tripItems.filter((i) => !!i.stop).map((item) => item.stop!.id)
      await tx.tripStop.deleteMany({ where: { id: { in: tripStopItemIds } } })
      await tx.tripItem.deleteMany({ where: { tripId: input.id } })
      await tx.trip.delete({ where: { id: input.id, creatorId: { equals: ctx.user.id } } })
    })
    return true
  }),
  info: protectedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    const trip = ctx.prisma.trip.findUnique({ where: { id: input.id, users: { some: { id: ctx.user.id } } } })
    if (!trip) throw new TRPCError({ code: "NOT_FOUND", message: "Trip not found" })
    return trip
  }),
  detail: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const trip = await ctx.prisma.trip.findUnique({
      where: { id: input.id, users: { some: { id: ctx.user.id } } },
      select: {
        name: true,
        creatorId: true,
        startDate: true,
        endDate: true,
        items: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            stop: { select: { id: true, image: true, name: true, latitude: true, longitude: true } },
            spot: {
              select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                type: true,
                images: { take: 1, orderBy: { createdAt: "desc" } },
              },
            },
          },
        },
        media: { take: 1, orderBy: { timestamp: "desc" }, select: { timestamp: true } },
      },
    })
    if (!trip) throw new TRPCError({ code: "NOT_FOUND", message: "Trip not found" })
    if (trip.items.length === 0) return { trip }
    if (trip.items.length === 1)
      return {
        trip,
        center: trip.items[0]?.spot
          ? [trip.items[0]?.spot.longitude, trip.items[0]?.spot.latitude]
          : ([trip.items[0]?.stop!.longitude, trip.items[0]?.stop!.latitude] as [number, number]),
      }
    const itemCoords = trip.items.map((item) => [
      item.spot?.longitude || item.stop?.longitude,
      item.spot?.latitude || item.stop?.latitude,
    ]) as [number, number][]
    const line = lineString(itemCoords)
    const bounds = bbox(line) as [number, number, number, number]

    const latestMediaSyncedAt = trip.media[0]?.timestamp

    // can be quite slow
    // const directions = await getDirections(itemCoords)
    return { trip, bounds, line, latestMediaSyncedAt }
  }),
  saveSpot: protectedProcedure
    .input(z.object({ spotId: z.string(), tripId: z.string(), order: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      let newOrder = input.order
      if (!input.order) {
        const tripItems = await ctx.prisma.trip.findUnique({ where: { id: input.tripId } }).items()
        newOrder = tripItems?.length || 0
      }
      return ctx.prisma.tripItem.create({
        data: { spotId: input.spotId, tripId: input.tripId, creatorId: ctx.user.id, order: newOrder },
      })
    }),
  saveStop: protectedProcedure
    .input(z.object({ tripId: z.string(), order: z.number().optional() }).merge(tripStopSchema))
    .mutation(async ({ ctx, input }) => {
      const { tripId, order, ...data } = input
      let newOrder = order
      if (!order) {
        const tripItems = await ctx.prisma.trip.findUniqueOrThrow({ where: { id: input.tripId } }).items()
        newOrder = tripItems.length || 0
      }
      const image = await getPlaceUnsplashImage(data.name)
      return ctx.prisma.$transaction(async (tx) => {
        const tripItem = await tx.tripItem.create({ data: { tripId, creatorId: ctx.user.id, order: newOrder } })
        return tx.tripStop.create({ data: { ...data, tripItemId: tripItem.id, image: image } })
      })
    }),
  removeItem: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.tripItem.findUniqueOrThrow({ where: { id: input.id }, include: { stop: true } })
    await ctx.prisma.$transaction(async (tx) => {
      if (item.stop) {
        await tx.tripStop.delete({ where: { id: item.stop.id } })
      }
      await tx.tripItem.delete({ where: { id: input.id } })
      return
    })
    return true
  }),
  users: protectedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.trip.findUniqueOrThrow({
      where: { id: input.id },
      select: {
        id: true,
        name: true,
        users: {
          where: { id: { not: { equals: ctx.user.id } } },
          select: { id: true, username: true, firstName: true, lastName: true, avatar: true, avatarBlurHash: true },
        },
      },
    })
  }),
  searchForUsers: protectedProcedure
    .input(z.object({ tripId: z.string(), skip: z.number(), search: z.string().optional() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        skip: input.skip,
        take: 12,
        where: {
          id: { not: ctx.user.id },
          trips: { none: { id: input.tripId } },
          OR: input.search
            ? [
                { username: { contains: input.search } },
                { firstName: { contains: input.search } },
                { lastName: { contains: input.search } },
              ]
            : undefined,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          avatar: true,
          avatarBlurHash: true,
        },
      })
    }),
  addUser: protectedProcedure.input(z.object({ tripId: z.string(), userId: z.string() })).mutation(({ ctx, input }) => {
    return ctx.prisma.trip.update({
      where: { id: input.tripId },
      data: { users: { connect: { id: input.userId } } },
    })
  }),
  removeUser: protectedProcedure.input(z.object({ tripId: z.string(), userId: z.string() })).mutation(({ ctx, input }) => {
    return ctx.prisma.trip.update({
      where: { id: input.tripId },
      data: { users: { disconnect: { id: input.userId } } },
    })
  }),
  updateOrder: protectedProcedure
    .input(z.object({ id: z.string(), items: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.$transaction(
        input.items.map((id, order) => ctx.prisma.tripItem.update({ where: { id }, data: { order } })),
      )
      return true
    }),
  uploadMedia: protectedProcedure
    .input(
      z.object({
        tripId: z.string(),
        images: z.array(
          z.object({ path: z.string(), latitude: z.number(), longitude: z.number(), assetId: z.string(), timestamp: z.date() }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // WIP
      const tripMedias = await ctx.prisma.tripMedia.createMany({
        data: input.images.map((image) => ({ tripId: input.tripId, ...image, creatorId: ctx.user.id })),
        skipDuplicates: true,
      })
      console.log(tripMedias)
      return true
    }),
})
