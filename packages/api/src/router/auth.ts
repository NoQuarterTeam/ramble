import { TRPCError } from "@trpc/server"
import bcrypt from "bcryptjs"

import { loginSchema, registerSchema } from "@ramble/shared"

import { createAuthToken } from "../lib/jwt"
import { createTRPCRouter, publicProcedure } from "../trpc"

export const authRouter = createTRPCRouter({
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const isSamePassword = bcrypt.compareSync(input.password, user.password)
    if (!isSamePassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const token = createAuthToken({ id: user.id })
    return { user, token }
  }),
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input: { accessCode, ...input } }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (user) throw new TRPCError({ code: "BAD_REQUEST", message: "Email already in use" })
    const accessRequest = await ctx.prisma.accessRequest.findUnique({ where: { code: accessCode } })
    if (!accessRequest) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid access code" })
    const username = input.username.toLowerCase().trim()
    const existingUsername = await ctx.prisma.user.findUnique({ where: { username } })
    if (existingUsername) throw new TRPCError({ code: "BAD_REQUEST", message: "User with this username already exists" })
    const hashedPassword = bcrypt.hashSync(input.password, 10)
    const newUser = await ctx.prisma.user.create({ data: { ...input, password: hashedPassword } })
    await ctx.prisma.accessRequest.update({ where: { id: accessRequest.id }, data: { acceptedAt: new Date() } })
    const token = createAuthToken({ id: newUser.id })
    return { user: newUser, token }
  }),
})
