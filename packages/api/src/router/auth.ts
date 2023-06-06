import { TRPCError } from "@trpc/server"
import bcrypt from "bcryptjs"

import { createAuthToken } from "../lib/jwt"
import { createTRPCRouter, publicProcedure } from "../trpc"

import { loginSchema, registerSchema } from "../schemas/user"

export const authRouter = createTRPCRouter({
  me: publicProcedure.query(({ ctx }) => ctx.user || null),
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const isSamePassword = bcrypt.compareSync(input.password, user.password)
    if (!isSamePassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const token = createAuthToken({ id: user.id })
    return { user, token }
  }),
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (user) throw new TRPCError({ code: "BAD_REQUEST", message: "Email already in use" })
    const hashedPassword = bcrypt.hashSync(input.password, 10)
    const newUser = await ctx.prisma.user.create({
      data: { ...input, password: hashedPassword },
    })
    const token = createAuthToken({ id: newUser.id })
    return { user: newUser, token }
  }),
})
