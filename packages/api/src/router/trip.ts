import { z } from "zod"

import { tripSchema } from "@ramble/server-schemas"

import { createTRPCRouter, protectedProcedure } from "../trpc"

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
    return ctx.prisma.trip.findUnique({
      where: { id: input.id, users: { some: { id: ctx.user.id } } },
      include: { items: { include: { spot: { include: { images: { take: 1, orderBy: { createdAt: "desc" } } } }, stop: true } } },
    })
  }),
  saveToTrip: protectedProcedure.input(z.object({ spotId: z.string(), tripId: z.string() })).mutation(async ({ ctx, input }) => {
    const tripItems = await ctx.prisma.trip.findUnique({ where: { id: input.tripId } }).items({ where: { spotId: input.spotId } })
    if (tripItems && tripItems.length > 0) {
      return ctx.prisma.tripItem.deleteMany({ where: { tripId: input.tripId, spotId: input.spotId } })
    } else {
      return ctx.prisma.tripItem.create({
        data: { spotId: input.spotId, tripId: input.tripId, creatorId: ctx.user.id },
      })
    }
  }),
})
