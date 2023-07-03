import { TRPCError } from "@trpc/server"

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

import { updateSchema, userInterestFields } from "@ramble/shared"
import { z } from "zod"

export const userRouter = createTRPCRouter({
  me: publicProcedure.query(({ ctx }) => ctx.user),
  profile: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { username: input.username },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        ...userInterestFields,
        followedBy: ctx.user ? { where: { id: ctx.user.id } } : undefined,
        bio: true,
      },
    })
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    return user
  }),
  update: protectedProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.update({ where: { id: ctx.user.id }, data: input })
    return user
  }),
  toggleFollow: protectedProcedure.input(z.object({ username: z.string() })).mutation(async ({ ctx, input }) => {
    if (input.username === ctx.user.username) throw new TRPCError({ code: "BAD_REQUEST" })
    const followedBy = await ctx.prisma.user.findUnique({ where: { username: input.username } }).followedBy({
      where: { id: ctx.user.id },
    })
    if (!followedBy) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    if (followedBy.length) {
      await ctx.prisma.user.update({
        where: { username: input.username },
        data: { followedBy: { disconnect: { id: ctx.user.id } } },
      })
    } else {
      await ctx.prisma.user.update({
        where: { username: input.username },
        data: { followedBy: { connect: { id: ctx.user.id } } },
      })
    }
    return true
  }),
})
