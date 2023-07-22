import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { listSchema } from "@ramble/shared"

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const listRouter = createTRPCRouter({
  allByUser: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
    return ctx.prisma.list.findMany({
      orderBy: { createdAt: "desc" },
      where: { creator: { username: input.username } },
      take: 10,
    })
  }),
  detail: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const list = await ctx.prisma.list.findFirst({
      where: { id: input.id },
      select: {
        id: true,
        creatorId: true,
        creator: { select: { username: true, firstName: true, lastName: true } },
        name: true,
        description: true,
        listSpots: {
          select: {
            id: true,
            spot: {
              select: {
                type: true,
                reviews: { select: { rating: true } },
                id: true,
                name: true,
                address: true,
                description: true,
                verifier: { select: { username: true, firstName: true, lastName: true, avatar: true } },
                images: { take: 1 },
              },
            },
          },
        },
      },
    })
    if (!list) throw new TRPCError({ code: "NOT_FOUND" })

    const formattedList = {
      ...list,
      listSpots: list.listSpots.map((listSpot) => ({
        ...listSpot,
        spot: {
          ...listSpot.spot,
          image: listSpot.spot.images[0]?.path,
          blurHash: listSpot.spot.images[0]?.blurHash,
          rating:
            listSpot.spot.reviews.length > 0
              ? Math.round(listSpot.spot.reviews.reduce((acc, review) => acc + review.rating, 0) / listSpot.spot.reviews.length)
              : undefined,
        },
      })),
    }
    return formattedList
  }),
  allByUserWithSavedSpots: protectedProcedure.input(z.object({ spotId: z.string() })).query(async ({ ctx, input }) => {
    return ctx.prisma.list.findMany({
      where: { creatorId: ctx.user.id },
      include: { listSpots: { where: { spotId: input.spotId } } },
      take: 10,
    })
  }),
  saveToList: protectedProcedure.input(z.object({ spotId: z.string(), listId: z.string() })).mutation(async ({ ctx, input }) => {
    const listSpot = await ctx.prisma.listSpot.findFirst({
      where: { spotId: input.spotId, listId: input.listId },
    })
    if (listSpot) {
      return ctx.prisma.listSpot.delete({ where: { id: listSpot.id } })
    } else {
      return ctx.prisma.listSpot.create({ data: { spotId: input.spotId, listId: input.listId } })
    }
  }),
  create: protectedProcedure.input(listSchema).mutation(({ ctx, input }) => {
    return ctx.prisma.list.create({ data: { ...input, creatorId: ctx.user.id } })
  }),
  update: protectedProcedure
    .input(listSchema.partial().extend({ id: z.string() }))
    .mutation(({ ctx, input: { id, ...data } }) => {
      return ctx.prisma.list.update({ where: { id }, data })
    }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
    return ctx.prisma.list.delete({ where: { id: input.id } })
  }),
})
