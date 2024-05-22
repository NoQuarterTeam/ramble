import { clusterSchema, userSchema } from "@ramble/server-schemas"
import {
  createAuthToken,
  deleteObject,
  generateBlurHash,
  sendAccountVerificationEmail,
  sendSlackMessage,
  sendUserFollowedNotification,
  updateLoopsContact,
} from "@ramble/server-services"
import { userInterestFields } from "@ramble/shared"
import { TRPCError } from "@trpc/server"
import { waitUntil } from "@vercel/functions"
import dayjs from "dayjs"
import Supercluster from "supercluster"
import { z } from "zod"

import type { User } from "@ramble/database/types"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const userRouter = createTRPCRouter({
  me: publicProcedure.query(({ ctx }) => ctx.user),
  profile: publicProcedure.input(userSchema.pick({ username: true })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { username: input.username, deletedAt: null },
      select: {
        id: true,
        username: true,
        instagram: true,
        firstName: true,
        lastName: true,
        avatar: true,
        avatarBlurHash: true,
        isLocationPrivate: true,
        ...userInterestFields,
        followers: ctx.user ? { where: { id: ctx.user.id } } : undefined,
        _count: { select: { followers: true, following: true } },
        bio: true,
      },
    })
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    return { ...user, isFollowedByMe: user.followers && user.followers.length > 0 }
  }),
  hasCreatedSpot: protectedProcedure.query(async ({ ctx }) => {
    const spot = await ctx.prisma.spot.findFirst({ where: { creatorId: ctx.user.id }, select: { id: true } })
    return !!spot
  }),
  update: protectedProcedure.input(userSchema.partial()).mutation(async ({ ctx, input }) => {
    if (input.username && input.username !== ctx.user.username) {
      const user = await ctx.prisma.user.findUnique({ where: { username: input.username } })
      if (user) throw new TRPCError({ code: "BAD_REQUEST", message: "Username already taken" })
    }
    let avatarBlurHash = ctx.user.avatarBlurHash
    if (input.avatar && input.avatar !== ctx.user.avatar) {
      if (ctx.user.avatar) await deleteObject(ctx.user.avatar)
      avatarBlurHash = await generateBlurHash(input.avatar)
    }
    const user = await ctx.prisma.user.update({ where: { id: ctx.user.id }, data: { ...input, avatarBlurHash } })
    updateLoopsContact({ userId: user.id, email: user.email, ...input })
    return user
  }),
  followers: publicProcedure.input(userSchema.pick({ username: true })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { username: input.username, deletedAt: null } })
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    return ctx.prisma.user.findUnique({ where: { username: input.username } }).followers({
      select: { id: true, username: true, firstName: true, lastName: true, avatar: true, avatarBlurHash: true },
    })
  }),
  following: publicProcedure.input(userSchema.pick({ username: true })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { username: input.username, deletedAt: null } })
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    return ctx.prisma.user.findUnique({ where: { username: input.username } }).following({
      select: { id: true, username: true, firstName: true, lastName: true, avatar: true, avatarBlurHash: true },
    })
  }),
  clusters: publicProcedure.input(clusterSchema.optional()).query(async ({ ctx, input: coords }) => {
    if (!coords) return []
    const users = await ctx.prisma.user.findMany({
      where: {
        deletedAt: null,
        isLocationPrivate: false,
        updatedAt: { gt: dayjs().subtract(1, "month").toDate() },
        latitude: { not: null, gt: coords.minLat, lt: coords.maxLat },
        longitude: { not: null, gt: coords.minLng, lt: coords.maxLng },
      },
      select: { id: true, username: true, avatar: true, avatarBlurHash: true, longitude: true, latitude: true },
    })
    const supercluster = new Supercluster<
      { cluster: false } & Pick<User, "id" | "avatar" | "avatarBlurHash" | "username">,
      { cluster: true }
    >({
      maxZoom: 16,
      radius: 50,
    })
    const clustersData = supercluster.load(
      users.map((user, i) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [user.longitude!, user.latitude!] },
        properties: {
          cluster: false,
          id: user.id,
          username: ctx.user ? user.username : `User ${i + 1}`,
          avatar: ctx.user ? user.avatar : null,
          avatarBlurHash: ctx.user ? user.avatarBlurHash : null,
        },
      })),
    )
    const clusters = clustersData.getClusters([coords.minLng, coords.minLat, coords.maxLng, coords.maxLat], coords.zoom || 5)
    return clusters.map((c) => ({
      ...c,
      properties: c.properties.cluster
        ? { ...c.properties, zoomLevel: supercluster.getClusterExpansionZoom(c.properties.cluster_id) }
        : c.properties,
    }))
  }),
  sendVerificationEmail: protectedProcedure.mutation(async ({ ctx }) => {
    const token = createAuthToken({ id: ctx.user.id })
    sendAccountVerificationEmail(ctx.user, token)
    return true
  }),
  toggleFollow: protectedProcedure.input(userSchema.pick({ username: true })).mutation(async ({ ctx, input }) => {
    if (input.username === ctx.user.username) throw new TRPCError({ code: "BAD_REQUEST" })
    const followers = await ctx.prisma.user
      .findUnique({ where: { username: input.username } })
      .followers({ where: { id: ctx.user.id } })

    if (!followers) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    if (followers.length) {
      await ctx.prisma.user.update({
        where: { username: input.username },
        data: { followers: { disconnect: { id: ctx.user.id } } },
      })
    } else {
      const user = await ctx.prisma.user.update({
        where: { username: input.username },
        data: { followers: { connect: { id: ctx.user.id } } },
      })
      waitUntil(sendUserFollowedNotification({ initiatorId: ctx.user.id, userId: user.id }))
    }
    return true
  }),
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const today = dayjs().format("YYYY-MM-DD")
    await ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: {
        deletedAt: new Date(),
        firstName: "Deleted",
        lastName: "User",
        email: `${today}-${ctx.user.email}`,
        bio: "",
        instagram: "",
        avatar: null,
        latitude: null,
        longitude: null,
      },
    })
    if (ctx.user.avatar) await deleteObject(ctx.user.avatar)
    sendSlackMessage(`😭 User @${ctx.user.username} deleted their account.`)
    return true
  }),
  guides: protectedProcedure.input(z.object({ skip: z.number() })).query(async ({ ctx, input }) => {
    return ctx.prisma.user.findMany({
      where: { role: "GUIDE", deletedAt: null },
      skip: input.skip,
      take: 12,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        avatar: true,
        avatarBlurHash: true,
        _count: {
          select: {
            followers: true,
            lists: { where: { isPrivate: false } },
            createdTrips: true,
            /**
             * @deprecated in v1.5.1 - use created now
             */
            verifiedSpots: { where: { sourceUrl: { equals: null }, deletedAt: null, verifiedAt: { not: null } } },
            createdSpots: { where: { sourceUrl: { equals: null }, deletedAt: null, verifiedAt: { not: null } } },
          },
        },
      },
    })
  }),
})
