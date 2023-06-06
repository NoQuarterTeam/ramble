import { TRPCError } from "@trpc/server"

import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"
import { updateSchema } from "../schemas/user"

export const userRouter = createTRPCRouter({
  byUsername: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { username: input.username } })
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    return user
  }),
  update: protectedProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.update({ where: { id: ctx.user.id }, data: input })
    return user
  }),
})
