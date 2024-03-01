import { z } from "zod"

import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "../../trpc"

export const tripItemsRouter = createTRPCRouter({
  update: protectedProcedure.input(z.object({ id: z.string(), date: z.date().nullish() })).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.tripItem.findUnique({ where: { id: input.id } })
    if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" })

    return ctx.prisma.tripItem.update({ where: { id: input.id }, data: { date: input.date } })
  }),
})
