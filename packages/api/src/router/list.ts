import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"
import { TRPCError } from "@trpc/server"

export const listRouter = createTRPCRouter({
  detail: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    // TODO: check if user is public
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
          rating:
            listSpot.spot.reviews.length > 0
              ? Math.round(listSpot.spot.reviews.reduce((acc, review) => acc + review.rating, 0) / listSpot.spot.reviews.length)
              : null,
        },
      })),
    }

    return formattedList
  }),
  savedLists: protectedProcedure.input(z.object({ spotId: z.string() })).query(async ({ ctx, input }) => {
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
})
