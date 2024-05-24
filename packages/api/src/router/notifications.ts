// import dayjs from "dayjs"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const notificatioRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const notis = await ctx.prisma.userNotification.findMany({
      orderBy: { createdAt: "desc" },
      where: { userId: ctx.user.id },
      include: {
        notification: {
          select: {
            id: true,
            type: true,
            createdAt: true,
            trip: { select: { id: true, name: true } },
            spot: { select: { id: true, name: true, cover: { select: { path: true, blurHash: true } } } },
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
    // for (const n of notis) {
    //   // temp fix until we figure out the timezone issue
    //   n.createdAt = dayjs(n.createdAt).subtract(2, "hours").toDate()
    // }
    return notis
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
