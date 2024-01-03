import { createTRPCRouter, publicProcedure } from "../trpc"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

export const spotRevisionRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        spotId: z.string(),
        notes: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "NOT_FOUND" })
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
