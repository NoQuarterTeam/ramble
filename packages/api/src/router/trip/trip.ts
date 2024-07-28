import { tripSchema, tripStopSchema } from "@ramble/server-schemas"
import {
  COUNTRIES,
  geocodeCoords,
  getPlaceUnsplashImage,
  sendSlackMessage,
  sendSpotAddedToTripNotification,
  sendTripSpotAddedNotification,
  sendTripStopAddedNotification,
  updateLoopsContact,
} from "@ramble/server-services"
import { uniq } from "@ramble/shared"
import { TRPCError } from "@trpc/server"
import bbox from "@turf/bbox"
import { lineString } from "@turf/helpers"
import { waitUntil } from "@vercel/functions"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../../trpc"
import { tripItemsRouter } from "./items"
import { tripMediaRouter } from "./media"
import { tripUsersRouter } from "./users"

export const tripRouter = createTRPCRouter({
  mine: protectedProcedure.input(z.object({ skip: z.number().optional() }).optional()).query(async ({ ctx, input }) => {
    const data = await ctx.prisma.trip.findMany({
      where: { users: { some: { id: ctx.user.id } } },
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        items: { orderBy: { order: "asc" }, select: { id: true, order: true, countryCode: true } },
        creator: { select: { avatar: true, avatarBlurHash: true, id: true, username: true, firstName: true, lastName: true } },
        users: { select: { id: true, username: true, avatar: true, avatarBlurHash: true, firstName: true, lastName: true } },
        media: {
          where: { deletedAt: null },
          orderBy: { timestamp: "desc" },
          take: 6,
          select: { id: true, path: true, thumbnailPath: true },
        },
      },
      take: 50, // TODO pagination
      skip: input?.skip || 0,
    })

    return data.map((trip) => {
      const countryFlags = []
      const countryCodes = []
      for (const item of trip.items) {
        const flag = COUNTRIES.find((c) => c.code === item.countryCode)?.emoji
        if (item.countryCode) countryCodes.push(item.countryCode)
        if (flag) countryFlags.push(flag)
      }
      return { ...trip, countryFlags: uniq(countryFlags), countryCodes: uniq(countryCodes) }
    })
  }),
  allWithSavedSpot: protectedProcedure.input(z.object({ spotId: z.string() })).query(async ({ ctx, input }) => {
    const trips = await ctx.prisma.trip.findMany({
      where: { users: { some: { id: ctx.user.id } } },
      orderBy: { startDate: "desc" },
      include: { items: { where: { spotId: { equals: input.spotId } } } },
    })
    return trips.map(({ items, ...trip }) => ({ ...trip, isSaved: items.length > 0 }))
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
    const trip = await ctx.prisma.trip.create({
      data: { ...input, creatorId: ctx.user.id, users: { connect: { id: ctx.user.id } } },
    })
    updateLoopsContact({ email: ctx.user.email, hasCreatedTrip: true })
    await sendSlackMessage(`🚌 New trip created by ${ctx.user.username}!`)
    return trip
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
      await tx.tripMedia.deleteMany({ where: { tripId: input.id } })
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
        id: true,
        name: true,
        creatorId: true,
        mediaSyncEnabled: true,
        startDate: true,
        endDate: true,
        media: {
          where: {
            deletedAt: null,
            latitude: { not: null },
            longitude: { not: null },
          },
          orderBy: { timestamp: "asc" },
          select: { timestamp: true, latitude: true, longitude: true },
        },
        items: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            date: true,
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
      },
    })
    if (!trip) throw new TRPCError({ code: "NOT_FOUND", message: "Trip not found" })
    const latestMedia = await ctx.prisma.tripMedia.findFirst({
      where: { tripId: input.id, trip: { users: { some: { id: ctx.user.id } } } },
      orderBy: { timestamp: "desc" },
      select: { timestamp: true },
    })
    // const media = trip.media.map((m) => ({ timestamp: m.timestamp, latitude: m.latitude, longitude: m.longitude }))

    const latestMediaTimestamp = latestMedia?.timestamp
    if (trip.items.length === 0) return { trip, latestMediaTimestamp }
    if (trip.items.length === 1)
      return {
        trip,
        latestMediaTimestamp,
        center: trip.items[0]?.spot
          ? [trip.items[0]?.spot.longitude, trip.items[0]?.spot.latitude]
          : ([trip.items[0]?.stop!.longitude, trip.items[0]?.stop!.latitude] as [number, number]),
      }

    const itemCoords = trip.items.flatMap((item, i) => {
      const nextItem = trip.items[i + 1]
      let coords = [[item.spot?.longitude || item.stop?.longitude, item.spot?.latitude || item.stop?.latitude]]
      if (!item.date) return coords
      if (!nextItem || !nextItem.date) return coords
      // TODO: what do we actually do here? if there's no date on next item, we can't really do anything, just dont include in route for now
      // if (!nextItem || !nextItem.date) {
      //   // put all remaining media after this item
      //   const mediaBetween = media.filter((m) => m.timestamp >= item.date!) // this makes no sense as it would add all media after every item in the loop, dumb.
      //   if (mediaBetween.length > 0) {
      //     coords = coords.concat(mediaBetween.map((m) => [m.longitude!, m.latitude!]))
      //   }
      //   return coords
      // }
      // put all media between this item and the next
      // const mediaBetween = media.filter((m) => m.timestamp >= item.date! && m.timestamp <= nextItem.date!)
      // if (mediaBetween.length > 0) {
        // coords = coords.concat(mediaBetween.map((m) => [m.longitude!, m.latitude!]))
      // }
      return coords
    }) as [number, number][]

    const line = lineString(itemCoords)
    const bounds = bbox(line) as [number, number, number, number]

    // can be quite slow
    // const directions = await getDirections(itemCoords)

    return { trip, bounds, line, latestMediaTimestamp }
  }),
  saveSpot: protectedProcedure
    .input(z.object({ spotId: z.string(), tripId: z.string(), order: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      let newOrder = input.order
      if (!newOrder) {
        const tripItems = await ctx.prisma.trip.findUnique({ where: { id: input.tripId } }).items({ select: { id: true } })
        newOrder = tripItems?.length || 0
      } else if (newOrder === -1) {
        const tripItems = await ctx.prisma.trip
          .findUnique({ where: { id: input.tripId } })
          .items({ orderBy: { order: "asc" }, select: { order: true } })
        if (tripItems && tripItems.length > 0 && tripItems[0]?.order && tripItems[0]?.order <= -1) {
          newOrder = tripItems[0]?.order - 1
        }
      }
      const spot = await ctx.prisma.spot.findUnique({ where: { id: input.spotId } })
      if (!spot) throw new TRPCError({ code: "NOT_FOUND", message: "Spot not found" })
      const data = await geocodeCoords({ latitude: spot.latitude, longitude: spot.longitude })
      const countryCode = COUNTRIES.find((c) => c.name === data.country)?.code
      const item = await ctx.prisma.tripItem.create({
        data: { spotId: input.spotId, tripId: input.tripId, creatorId: ctx.user.id, order: newOrder, countryCode },
      })
      waitUntil(sendTripSpotAddedNotification({ initiatorId: ctx.user.id, tripId: input.tripId }))
      waitUntil(sendSpotAddedToTripNotification({ spotId: input.spotId, initiatorId: ctx.user.id }))
      return item
    }),
  saveStop: protectedProcedure
    .input(z.object({ tripId: z.string(), order: z.number().optional() }).merge(tripStopSchema))
    .mutation(async ({ ctx, input }) => {
      const { tripId, order, ...data } = input
      let newOrder = order
      if (!newOrder) {
        const tripItems = await ctx.prisma.trip.findUniqueOrThrow({ where: { id: input.tripId } }).items({ select: { id: true } })
        newOrder = tripItems.length || 0
      } else if (newOrder === -1) {
        const tripItems = await ctx.prisma.trip
          .findUnique({ where: { id: input.tripId } })
          .items({ orderBy: { order: "asc" }, select: { order: true } })
        if (tripItems && tripItems.length > 0 && tripItems[0]?.order && tripItems[0]?.order <= -1) {
          newOrder = tripItems[0]?.order - 1
        }
      }
      const image = await getPlaceUnsplashImage(data.name)
      const stop = await ctx.prisma.$transaction(async (tx) => {
        const geoData = await geocodeCoords({ latitude: data.latitude, longitude: data.longitude })
        const countryCode = COUNTRIES.find((c) => c.name === geoData.country)?.code
        const tripItem = await tx.tripItem.create({ data: { tripId, creatorId: ctx.user.id, order: newOrder, countryCode } })
        return tx.tripStop.create({ data: { ...data, tripItemId: tripItem.id, image: image } })
      })

      waitUntil(sendTripStopAddedNotification({ initiatorId: ctx.user.id, tripId: input.tripId }))
      return stop
    }),
  updateOrder: protectedProcedure
    .input(z.object({ id: z.string(), items: z.array(z.string()), itemDateResetId: z.string().optional() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.$transaction(async (tx) => {
        if (input.itemDateResetId) {
          await tx.tripItem.update({ where: { id: input.itemDateResetId }, data: { date: null } })
        }
        await Promise.all(input.items.map((id, order) => tx.tripItem.update({ where: { id }, data: { order } })))
        return true
      })
    }),
  /**
   *  @deprecated in 1.4.11 - use users key
   */
  usersV2: tripUsersRouter,
  users: tripUsersRouter,
  media: tripMediaRouter,
  items: tripItemsRouter,
})
