import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"
import { reviewSchema } from "../schemas/review"
import { TRPCError } from "@trpc/server"

export const reviewRouter = createTRPCRouter({
  detail: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    // TODO: check if user is public
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
  update: protectedProcedure.input(reviewSchema.extend({ id: z.string() })).mutation(async ({ ctx, input: { id, ...input } }) => {
    const review = await ctx.prisma.review.findUnique({ where: { id }, select: { userId: true } })
    if (!review) throw new TRPCError({ code: "NOT_FOUND" })
    if (review.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" })
    return ctx.prisma.review.update({ where: { id }, data: input })
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const review = await ctx.prisma.review.findUnique({ where: { id: input.id }, select: { userId: true } })
    if (!review) throw new TRPCError({ code: "NOT_FOUND" })
    if (review.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" })
    return ctx.prisma.review.delete({ where: { id: input.id } })
  }),
})
