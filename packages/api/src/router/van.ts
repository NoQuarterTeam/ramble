import { vanSchema } from "@ramble/shared"
import { createTRPCRouter, protectedProcedure, publicProfileProcedure } from "../trpc"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

export const vanRouter = createTRPCRouter({
  byUser: publicProfileProcedure.query(async ({ ctx }) => {
    return ctx.prisma.van.findUnique({ where: { userId: ctx.publicUser.id }, include: { images: true } })
  }),
  update: protectedProcedure
    .input(vanSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input: { id, ...data } }) => {
      const van = await ctx.prisma.van.findUnique({ where: { id } })
      if (!van) throw new TRPCError({ code: "NOT_FOUND" })
      if (van.userId !== ctx.user.id) throw new TRPCError({ code: "UNAUTHORIZED" })
      return ctx.prisma.van.update({ where: { id }, data })
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
