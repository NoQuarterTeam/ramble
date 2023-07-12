import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { vanSchema } from "@ramble/shared"

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const vanRouter = createTRPCRouter({
  mine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.van.findUnique({ where: { userId: ctx.user.id }, include: { images: true } })
  }),
  byUser: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { username: input.username } })
    if (!user) throw new TRPCError({ code: "NOT_FOUND" })
    return ctx.prisma.van.findUnique({ where: { userId: user.id }, include: { images: true } })
  }),
  update: protectedProcedure
    .input(vanSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input: { id, ...data } }) => {
      const van = await ctx.prisma.van.findUnique({ where: { id } })
      if (!van) throw new TRPCError({ code: "NOT_FOUND" })
      if (van.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" })
      return ctx.prisma.van.update({ where: { id }, data })
    }),
  saveImages: protectedProcedure.input(z.object({ keys: z.array(z.string()) })).mutation(async ({ ctx, input }) => {
    const van = await ctx.prisma.van.findUnique({ where: { userId: ctx.user.id } })
    if (!van) throw new TRPCError({ code: "NOT_FOUND" })
    if (van.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" })
    return ctx.prisma.van.update({
      where: { id: van.id },
      data: { images: { createMany: { data: input.keys.map((path) => ({ path })) } } },
    })
  }),
  removeImage: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const van = await ctx.prisma.van.findUnique({ where: { userId: ctx.user.id } })
    if (!van) throw new TRPCError({ code: "NOT_FOUND" })
    if (van.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" })
    return ctx.prisma.van.update({ where: { id: van.id }, data: { images: { delete: { id: input.id } } } })
  }),
  upsert: protectedProcedure
    .input(vanSchema.extend({ id: z.string().nullish() }))
    .mutation(async ({ ctx, input: { id, ...data } }) => {
      if (!id) return ctx.prisma.van.create({ data: { ...data, userId: ctx.user.id } })
      const van = await ctx.prisma.van.findUnique({ where: { id } })
      if (!van) throw new TRPCError({ code: "NOT_FOUND" })
      if (van.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" })
      return ctx.prisma.van.update({ where: { id }, data })
    }),
})
