import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { listSchema } from "@ramble/shared"

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"
import { type SpotItemWithStats } from "@ramble/shared"

export const listRouter = createTRPCRouter({
  allByUser: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
    const currentUser = ctx.user?.username
    return ctx.prisma.list.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        creator: { username: input.username },
        isPrivate: !currentUser || currentUser !== input.username ? false : undefined,
      },
      take: 10,
    })
  }),
  detail: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const currentUser = ctx.user?.username
    const [list, spots] = await Promise.all([
      ctx.prisma.list.findFirst({
        where: { id: input.id },
        select: {
          id: true,
          creatorId: true,
          isPrivate: true,
          creator: { select: { username: true, firstName: true, lastName: true } },
          name: true,
          description: true,
        },
      }),
      ctx.prisma.$queryRaw<Array<SpotItemWithStats>>`
      SELECT 
        Spot.id, Spot.name, Spot.type, Spot.address, AVG(Review.rating) as rating,
        Spot.latitude, Spot.longitude,
        (SELECT path FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS image,
        (SELECT blurHash FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS blurHash,
        (CAST(COUNT(ListSpot.spotId) as CHAR(32))) AS savedCount
      FROM
        Spot
      LEFT JOIN
        Review ON Spot.id = Review.spotId
      LEFT JOIN
        ListSpot ON Spot.id = ListSpot.spotId
      WHERE
        ListSpot.listId = ${input.id} AND Spot.deletedAt IS NULL
      GROUP BY
        Spot.id
      ORDER BY
        Spot.id
      `,
    ])
    if (!list || (list.isPrivate && (!currentUser || currentUser !== list.creator.username)))
      throw new TRPCError({ code: "NOT_FOUND" })

    return { list, spots }
  }),
  allByUserWithSavedSpots: protectedProcedure.input(z.object({ spotId: z.string() })).query(async ({ ctx, input }) => {
    return ctx.prisma.list.findMany({
      where: { creatorId: ctx.user.id },
      orderBy: { createdAt: "desc" },
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
