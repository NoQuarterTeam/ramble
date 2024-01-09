import { createTRPCRouter, protectedProcedure } from "../trpc"
import { z } from "zod"

export const spotRevisionRouter = createTRPCRouter({
  create: protectedProcedure.input(z.object({ spotId: z.string(), notes: z.string() })).mutation(async ({ ctx, input }) => {
    const spotRevision = await ctx.prisma.spotRevision.create({
      data: {
        spotId: input.spotId,
        notes: JSON.parse(input.notes),
        creatorId: ctx.user.id,
      },
    })
    return spotRevision
  }),
})
