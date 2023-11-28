import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { reviewDataSchema, reviewSchema } from "@ramble/server-schemas"

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const reviewRouter = createTRPCRouter({
  detail: publicProcedure.input(z.object({ id: z.string().uuid() })).query(({ ctx, input }) => {
    return ctx.prisma.review.findUnique({ where: { id: input.id }, include: { spot: true } })
  }),
  create: protectedProcedure.input(reviewSchema).mutation(async ({ ctx, input }) => {
    const existingReviewsWithin1Month = await ctx.prisma.review.count({
      where: {
        spotId: input.spotId,
        userId: ctx.user.id,
        createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
      },
    })
    if (existingReviewsWithin1Month > 0)
      throw new TRPCError({ code: "BAD_REQUEST", message: "You can only review a spot once per month." })
    return ctx.prisma.review.create({ data: { ...input, userId: ctx.user.id } })
  }),
  update: protectedProcedure
    .input(reviewDataSchema.partial().extend({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input: { id, ...input } }) => {
      const review = await ctx.prisma.review.findUnique({ where: { id }, select: { userId: true } })
      if (!review) throw new TRPCError({ code: "NOT_FOUND" })
      if (review.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" })
      return ctx.prisma.review.update({ where: { id }, data: input })
    }),
  delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const review = await ctx.prisma.review.findUnique({ where: { id: input.id }, select: { userId: true } })
    if (!review) throw new TRPCError({ code: "NOT_FOUND" })
    if (review.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" })
    return ctx.prisma.review.delete({ where: { id: input.id } })
  }),
})
