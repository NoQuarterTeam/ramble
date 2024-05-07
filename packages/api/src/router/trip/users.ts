import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "../../trpc"

export const tripUsersRouter = createTRPCRouter({
  all: protectedProcedure.input(z.object({ tripId: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.trip.findUniqueOrThrow({
      where: { id: input.tripId },
      select: {
        id: true,
        name: true,
        creatorId: true,
        users: {
          select: { id: true, username: true, firstName: true, lastName: true, avatar: true, avatarBlurHash: true },
        },
      },
    })
  }),
  search: protectedProcedure
    .input(z.object({ tripId: z.string(), skip: z.number(), search: z.string().optional() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        skip: input.skip,
        take: 12,
        where: {
          id: { not: ctx.user.id },
          trips: { none: { id: input.tripId } },
          OR: input.search
            ? [
                { username: { contains: input.search } },
                { firstName: { contains: input.search } },
                { lastName: { contains: input.search } },
              ]
            : undefined,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          avatar: true,
          avatarBlurHash: true,
        },
      })
    }),
  add: protectedProcedure.input(z.object({ tripId: z.string(), userId: z.string() })).mutation(({ ctx, input }) => {
    return ctx.prisma.trip.update({
      where: { id: input.tripId },
      data: { users: { connect: { id: input.userId } } },
    })
  }),
  remove: protectedProcedure.input(z.object({ tripId: z.string(), userId: z.string() })).mutation(({ ctx, input }) => {
    return ctx.prisma.trip.update({
      where: { id: input.tripId },
      data: { users: { disconnect: { id: input.userId } } },
    })
  }),
})
