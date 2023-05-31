import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"

export const spotRouter = createTRPCRouter({
  clusters: publicProcedure.query(({ ctx }) =>
    ctx.prisma.spot.findMany({ take: 40, select: { id: true, latitude: true, longitude: true, type: true } }),
  ),
  latest: publicProcedure.query(({ ctx }) =>
    ctx.prisma.spot.findMany({ take: 20, select: { id: true, name: true, type: true } }),
  ),
  byId: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) =>
    ctx.prisma.spot.findUnique({
      where: { id: input.id },
      include: { verifier: true, _count: { select: { reviews: true } }, images: true },
    }),
  ),
})
