import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { updateSchema, userInterestFields } from "@ramble/shared"

import { createAuthToken } from "../lib/jwt"
import { generateBlurHash } from "../services/generateBlurHash.server"
import { sendAccountVerificationEmail } from "../services/mailers/user.server"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"
import { sendSlackMessage } from "../services/slack.server"

export const userRouter = createTRPCRouter({
  me: publicProcedure.query(({ ctx }) => ctx.user),
  profile: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { username: input.username },
      select: {
        id: true,
        username: true,
        instagram: true,
        firstName: true,
        lastName: true,
        avatar: true,
        avatarBlurHash: true,
        ...userInterestFields,
        followers: ctx.user ? { where: { id: ctx.user.id } } : undefined,
        _count: { select: { followers: true, following: true } },
        bio: true,
      },
    })
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    return { ...user, isFollowedByMe: user.followers && user.followers.length > 0 }
  }),
  update: protectedProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
    const username = input.username?.toLowerCase().trim()
    if (username && username !== ctx.user.username) {
      const user = await ctx.prisma.user.findUnique({ where: { username } })
      if (user) throw new TRPCError({ code: "BAD_REQUEST", message: "Username already taken" })
    }
    let avatarBlurHash = ctx.user.avatarBlurHash
    if (input.avatar && input.avatar !== ctx.user.avatar) {
      avatarBlurHash = await generateBlurHash(input.avatar)
    }
    const user = await ctx.prisma.user.update({ where: { id: ctx.user.id }, data: { ...input, username, avatarBlurHash } })
    return user
  }),
  followers: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { username: input.username } })
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    return ctx.prisma.user.findUnique({ where: { username: input.username } }).followers({
      select: { id: true, username: true, firstName: true, lastName: true, avatar: true, avatarBlurHash: true },
    })
  }),
  following: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { username: input.username } })
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    return ctx.prisma.user.findUnique({ where: { username: input.username } }).following({
      select: { id: true, username: true, firstName: true, lastName: true, avatar: true, avatarBlurHash: true },
    })
  }),
  sendVerificationEmail: protectedProcedure.mutation(async ({ ctx }) => {
    const token = createAuthToken({ id: ctx.user.id })
    await sendAccountVerificationEmail(ctx.user, token)
    return true
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
      await ctx.prisma.user.update({ where: { username: input.username }, data: { followers: { connect: { id: ctx.user.id } } } })
    }
    return true
  }),
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    sendSlackMessage(`😭 User @${ctx.user.username} deleted their account.`)
    await ctx.prisma.user.delete({ where: { id: ctx.user.id } })
    return true
  }),
})
