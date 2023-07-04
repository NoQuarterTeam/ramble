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
        followers: ctx.user ? { where: { id: ctx.user.id } } : undefined,
        _count: { select: { followers: true, following: true } },
        bio: true,
      },
    })
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    return user
  }),
  update: protectedProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
    const username = input.username?.toLowerCase().trim()
    const user = await ctx.prisma.user.update({ where: { id: ctx.user.id }, data: { ...input, username } })
    return user
  }),
  followers: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { username: input.username } })
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    return ctx.prisma.user.findUnique({ where: { username: input.username } }).followers({
      select: { id: true, username: true, firstName: true, lastName: true, avatar: true },
    })
  }),
  following: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { username: input.username } })
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    return ctx.prisma.user.findUnique({ where: { username: input.username } }).following({
      select: { id: true, username: true, firstName: true, lastName: true, avatar: true },
    })
  }),
  toggleFollow: protectedProcedure.input(z.object({ username: z.string() })).mutation(async ({ ctx, input }) => {
    if (input.username === ctx.user.username) throw new TRPCError({ code: "BAD_REQUEST" })
    const followers = await ctx.prisma.user.findUnique({ where: { username: input.username } }).followers({
      where: { id: ctx.user.id },
    })
    if (!followers) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    if (followers.length) {
      await ctx.prisma.user.update({
        where: { username: input.username },
        data: { followers: { disconnect: { id: ctx.user.id } } },
      })
    } else {
      await ctx.prisma.user.update({
        where: { username: input.username },
        data: { followers: { connect: { id: ctx.user.id } } },
      })
    }
    return true
  }),
})
