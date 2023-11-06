import { createTRPCRouter, protectedProcedure } from "../trpc"

export const inviteCodeRouter = createTRPCRouter({
  myCodes: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.inviteCode.findMany({ where: { ownerId: ctx.user.id }, include: { user: true } })
  }),
})
