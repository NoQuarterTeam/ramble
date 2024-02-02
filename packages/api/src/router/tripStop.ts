import { z } from "zod"

import { tripStopSchema } from "@ramble/server-schemas"

import { createTRPCRouter, protectedProcedure } from "../trpc"

export const tripStopRouter = createTRPCRouter({
  create: protectedProcedure.input(tripStopSchema).mutation(async ({ ctx, input }) => {
    const tripItems = await ctx.prisma.trip.findUnique({ where: { id: input.tripId } }).items({ select: { id: true } })
    const tripItem = await ctx.prisma.tripItem.create({
      data: {
        tripId: input.tripId,
        creatorId: ctx.user.id,
        order: tripItems?.length || 0, // put at last order for now
      },
    })
    const { tripId, ...data } = input
    await ctx.prisma.tripStop.create({ data: { ...data, tripItemId: tripItem.id } })
    return true
  }),
})
