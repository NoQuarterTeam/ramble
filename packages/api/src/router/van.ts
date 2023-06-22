import { createTRPCRouter, publicProfileProcedure } from "../trpc"

export const vanRouter = createTRPCRouter({
  byUser: publicProfileProcedure.query(async ({ ctx }) => {
    return ctx.prisma.van.findUnique({ where: { userId: ctx.publicUser.id }, include: { images: true } })
  }),
})
