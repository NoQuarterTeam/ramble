import { createTRPCRouter, protectedProcedure } from "../trpc"

export const notificatioRouter = createTRPCRouter({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.userNotification.findMany({
      orderBy: { createdAt: "desc" },
      where: { userId: ctx.user.id },
      include: {
        notification: {
          select: {
            id: true,
            type: true,
            createdAt: true,
            trip: { select: { id: true, name: true } },
            initiator: {
              select: {
                id: true,
                username: true,
                avatar: true,
                avatarBlurHash: true,
                followers: {
                  take: 1,
                  select: { id: true },
                  where: { id: ctx.user.id },
                },
              },
            },
          },
        },
      },
      take: 40,
    })
  }),
  unreadCount: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.userNotification.count({
      where: { userId: ctx.user.id, status: "UNREAD" },
    })
  }),
  markSeed: protectedProcedure.mutation(({ ctx }) => {
    return ctx.prisma.userNotification.updateMany({
      where: { userId: ctx.user.id, status: "UNREAD" },
      data: { status: "SEEN" },
    })
  }),
})
