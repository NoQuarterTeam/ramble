import { TRPCError } from "@trpc/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

import { createAuthToken } from "../lib/jwt"
import { createImageUrl } from "../lib/s3"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(2),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  avatar: z.string().optional(),
})
export const loginSchema = userSchema.pick({ email: true, password: true })
export const registerSchema = userSchema.pick({ email: true, password: true, firstName: true, lastName: true })
export const updateSchema = userSchema.partial()

export const authRouter = createTRPCRouter({
  me: publicProcedure.query(({ ctx }) => (ctx.user ? { ...ctx.user, avatar: createImageUrl(ctx.user.avatar) } : null)),
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const isSamePassword = bcrypt.compareSync(input.password, user.password)
    if (!isSamePassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const token = createAuthToken({ id: user.id })
    return { user: { ...user, avatar: createImageUrl(user.avatar) }, token }
  }),
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (user) throw new TRPCError({ code: "BAD_REQUEST", message: "Email already in use" })
    const hashedPassword = bcrypt.hashSync(input.password, 10)
    const newUser = await ctx.prisma.user.create({
      data: { ...input, password: hashedPassword },
    })
    const token = createAuthToken({ id: newUser.id })
    return { user: { ...newUser, avatar: createImageUrl(newUser.avatar) }, token }
  }),
  update: protectedProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: input,
    })
    return { ...user, avatar: createImageUrl(user.avatar) }
  }),
})
