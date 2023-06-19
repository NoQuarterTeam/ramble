import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const listRouter = createTRPCRouter({
  detail: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    // TODO: check if user is public
    return ctx.prisma.list.findUnique({ where: { id: input.id }, include: { listSpots: { include: { spot: true } } } })
  }),
  savedLists: protectedProcedure.input(z.object({ spotId: z.string() })).query(async ({ ctx, input }) => {
    return ctx.prisma.list.findMany({
      where: { creatorId: ctx.user.id },
      include: { listSpots: { where: { spotId: input.spotId } } },
      take: 10,
    })
  }),
  saveToList: protectedProcedure.input(z.object({ spotId: z.string(), listId: z.string() })).mutation(async ({ ctx, input }) => {
    const listSpot = await ctx.prisma.listSpot.findFirst({
      where: { spotId: input.spotId, listId: input.listId },
    })
    if (listSpot) {
      return ctx.prisma.listSpot.delete({ where: { id: listSpot.id } })
    } else {
      return ctx.prisma.listSpot.create({ data: { spotId: input.spotId, listId: input.listId } })
    }
  }),
})
