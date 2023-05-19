import { createTRPCRouter, publicProcedure } from "../trpc"

export const spotRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }) => ctx.prisma.spot.findMany({ take: 40 })),
})
