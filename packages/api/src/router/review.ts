import { groupBy } from "@ramble/shared"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { reviewSchema, reviewTags } from "@ramble/server-schemas"
import { getLanguage } from "@ramble/server-services"

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const reviewRouter = createTRPCRouter({
  detail: publicProcedure.input(z.object({ id: z.string().uuid() })).query(({ ctx, input }) => {
    return ctx.prisma.review.findUnique({
      where: { id: input.id },
      include: { spot: { select: { id: true, type: true } }, tags: { select: { id: true, category: true, name: true } } },
    })
  }),
  create: protectedProcedure.input(reviewSchema.and(reviewTags)).mutation(async ({ ctx, input }) => {
    const existingReviewsWithin1Month = await ctx.prisma.review.count({
      where: {
        spotId: input.spotId,
        userId: ctx.user.id,
        createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
      },
    })
    if (existingReviewsWithin1Month > 0)
      throw new TRPCError({ code: "BAD_REQUEST", message: "You can only review a spot once per month." })
    const language = await getLanguage(input.description)
    const { tagIds, ...data } = input
    return ctx.prisma.review.create({
      data: {
        ...data,
        language,
        userId: ctx.user.id,
        tags: { connect: tagIds?.map((tagId) => ({ id: tagId })) },
      },
    })
  }),
  update: protectedProcedure
    .input(
      reviewSchema
        .omit({ spotId: true })
        .partial()
        .and(reviewTags)
        .and(z.object({ id: z.string().uuid() })),
    )
    .mutation(async ({ ctx, input: { id, ...input } }) => {
      const review = await ctx.prisma.review.findUnique({
        where: { id },
        select: { userId: true, description: true, language: true },
      })
      if (!review) throw new TRPCError({ code: "NOT_FOUND" })
      if (review.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" })
      const { tagIds, ...data } = input
      return ctx.prisma.review.update({
        where: { id },
        data: { ...data, tags: tagIds ? { set: tagIds.map((tagId) => ({ id: tagId })) } : undefined },
      })
    }),
  delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const review = await ctx.prisma.review.findUnique({ where: { id: input.id }, select: { userId: true } })
    if (!review) throw new TRPCError({ code: "NOT_FOUND" })
    if (review.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" })
    return ctx.prisma.review.delete({ where: { id: input.id } })
  }),
  groupedTags: protectedProcedure.query(async ({ ctx }) => {
    const tags = await ctx.prisma.tag.findMany()
    return groupBy(tags, (tag) => tag.category)
  }),
})
