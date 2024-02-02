import { tripStopSchema } from "@ramble/server-schemas"

import { createTRPCRouter, protectedProcedure } from "../trpc"

export const tripStopRouter = createTRPCRouter({
  create: protectedProcedure.input(tripStopSchema).mutation(async ({ ctx, input }) => {
    const tripItem = await ctx.prisma.tripItem.create({
      data: { tripId: input.tripId, creatorId: ctx.user.id, order: input.order },
    })
    const { tripId: _, ...data } = input
    const tripStop = await ctx.prisma.tripStop.create({ data: { ...data, tripItemId: tripItem.id } })
    await ctx.prisma.tripItem.update({ where: { id: tripItem.id }, data: { stopId: tripStop.id } })
    return true
  }),
})
