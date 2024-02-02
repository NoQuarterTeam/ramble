import { z } from "zod"

import { tripSchema } from "@ramble/server-schemas"

import { createTRPCRouter, protectedProcedure } from "../trpc"
import { TRPCError } from "@trpc/server"

export const tripRouter = createTRPCRouter({
  mine: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUniqueOrThrow({ where: { id: ctx.user.id } }).trips({
      include: { items: true, creator: true },
    })
  }),
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
    const trip = await ctx.prisma.trip.findUnique({
      where: { id: input.id, users: { some: { id: ctx.user.id } } },
      select: {
        name: true,
        items: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            spot: { select: { id: true, name: true, type: true, images: { take: 1, orderBy: { createdAt: "desc" } } } },
            stop: { select: { id: true, name: true, latitude: true, longitude: true } },
          },
        },
      },
    })
    if (!trip) throw new TRPCError({ code: "NOT_FOUND", message: "Trip not found" })
    return trip
  }),
  saveToTrip: protectedProcedure.input(z.object({ spotId: z.string(), tripId: z.string() })).mutation(async ({ ctx, input }) => {
    const tripItems = await ctx.prisma.trip.findUnique({ where: { id: input.tripId } }).items({ where: { spotId: input.spotId } })
    if (tripItems && tripItems.length > 0) {
      // TODO: perhaps don't want to deleteMany, as there might be the same spot more than once on this trip but user might only be wanting to remove it once?
      return ctx.prisma.tripItem.deleteMany({ where: { tripId: input.tripId, spotId: input.spotId } })
    } else {
      return ctx.prisma.tripItem.create({
        data: { spotId: input.spotId, tripId: input.tripId, creatorId: ctx.user.id },
      })
    }
  }),
  updateOrder: protectedProcedure
    .input(z.object({ id: z.string(), items: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.$transaction(
        input.items.map((id, order) => ctx.prisma.tripItem.update({ where: { id }, data: { order } })),
      )
      return true
    }),
})
