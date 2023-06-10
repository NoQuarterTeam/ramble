import { z } from "zod"
import { createTRPCRouter, publicProfileProcedure } from "../trpc"

export const listRouter = createTRPCRouter({
  detail: publicProfileProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.list.findUnique({ where: { id: input.id }, include: { listSpots: { include: { spot: true } } } }),
    ),
})
