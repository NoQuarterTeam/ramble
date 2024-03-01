import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "../../trpc"

export const tripItemsRouter = createTRPCRouter({
  update: protectedProcedure.input(z.object({ id: z.string(), date: z.date().nullish() })).mutation(({ ctx, input }) => {
    return ctx.prisma.tripItem.update({ where: { id: input.id }, data: { date: input.date } })
  }),
})
