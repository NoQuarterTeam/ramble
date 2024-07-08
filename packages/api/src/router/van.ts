import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { userSchema, vanSchema } from "@ramble/server-schemas"
import { deleteObject, generateBlurHash } from "@ramble/server-services"

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const vanRouter = createTRPCRouter({
  mine: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.van.findUnique({ where: { userId: ctx.user.id }, include: { images: true } })
  }),
  byUser: publicProcedure.input(userSchema.pick({ username: true })).query(async ({ ctx, input }) => {
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
      return ctx.prisma.van.update({ where: { id }, data: { ...data, year: data.year ? Number(data.year) : undefined } })
    }),
  saveImages: protectedProcedure.input(z.object({ paths: z.array(z.string()) })).mutation(async ({ ctx, input }) => {
    const van = await ctx.prisma.van.findUnique({ where: { userId: ctx.user.id } })
    if (!van) throw new TRPCError({ code: "NOT_FOUND" })
    if (van.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" })
    const imageData = await Promise.all(
      input.paths.map(async (path) => {
        const blurHash = await generateBlurHash(path)
        return { path, blurHash }
      }),
    )
    return ctx.prisma.van.update({ where: { id: van.id }, data: { images: { create: imageData } } })
  }),
  removeImage: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const vanImage = await ctx.prisma.vanImage.findUnique({ where: { id: input.id, van: { userId: ctx.user.id } } })
    if (!vanImage) throw new TRPCError({ code: "NOT_FOUND" })
    await deleteObject(vanImage.path)
    return ctx.prisma.vanImage.delete({ where: { id: input.id } })
  }),
  upsert: protectedProcedure
    .input(vanSchema.extend({ id: z.string().nullish() }))
    .mutation(async ({ ctx, input: { id, ...data } }) => {
      if (!id) return ctx.prisma.van.create({ data: { ...data, year: Number(data.year), userId: ctx.user.id } })
      const van = await ctx.prisma.van.findUnique({ where: { id } })
      if (!van) throw new TRPCError({ code: "NOT_FOUND" })
      if (van.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" })
      return ctx.prisma.van.update({ where: { id }, data: { ...data, year: Number(data.year) } })
    }),
})
