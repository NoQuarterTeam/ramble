import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { registerSchema, userSchema } from "@ramble/server-schemas"
import {
  comparePasswords,
  createAccessRequest,
  createAuthToken,
  createToken,
  decodeToken,
  hashPassword,
  sendAccessRequestConfirmationEmail,
  sendAccountVerificationEmail,
  sendResetPasswordEmail,
  sendSlackMessage,
  updateLoopsContact,
} from "@ramble/server-services"

import dayjs from "dayjs"
import { createTRPCRouter, publicProcedure } from "../trpc"

export const authRouter = createTRPCRouter({
  login: publicProcedure.input(userSchema.pick({ email: true, password: true })).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const isSamePassword = comparePasswords(input.password, user.password)
    if (!isSamePassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const token = createAuthToken({ id: user.id })
    return { user, token }
  }),
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    const existingEmail = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (existingEmail) throw new TRPCError({ code: "BAD_REQUEST", message: "Email already in use" })
    const existingUsername = await ctx.prisma.user.findUnique({ where: { username: input.username } })
    if (existingUsername) throw new TRPCError({ code: "BAD_REQUEST", message: "User with this username already exists" })
    const hashedPassword = hashPassword(input.password)
    const user = await ctx.prisma.user.create({
      data: {
        ...input,
        lists: { create: { name: "Favourites", description: "All my favourite spots" } },
        password: hashedPassword,
        trialExpiresAt: dayjs().add(1, "month").toDate(),
      },
    })
    const verifyToken = createToken({ id: user.id })
    await sendAccountVerificationEmail(user, verifyToken)
    const token = createAuthToken({ id: user.id })
    void updateLoopsContact({ ...user, signedUpAt: user.createdAt.toISOString(), userId: user.id })
    void sendSlackMessage(`🔥 @${user.username} signed up!`)
    return { user, token }
  }),
  forgotPassword: publicProcedure.input(userSchema.pick({ email: true })).mutation(async ({ input, ctx }) => {
    const email = input.email.toLowerCase().trim()
    const user = await ctx.prisma.user.findUnique({ where: { email } })
    if (user) {
      const token = createToken({ id: user.id })
      await sendResetPasswordEmail(user, token)
    }
    return true
  }),
  resetPassword: publicProcedure
    .input(userSchema.pick({ password: true }).and(z.object({ token: z.string() })))
    .mutation(async ({ input, ctx }) => {
      const payload = decodeToken<{ id: string }>(input.token)
      if (!payload) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid token" })
      const user = await ctx.prisma.user.findUnique({ where: { id: payload.id } })
      if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid token" })
      const updated = await ctx.prisma.user.update({
        where: { id: payload.id },
        data: { password: hashPassword(input.password) },
      })
      return updated
    }),
  requestAccess: publicProcedure
    .input(
      z.object({
        email: z
          .string()
          .email()
          .transform((e) => e.toLowerCase().trim()),
        reason: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const accessRequest = await ctx.prisma.accessRequest.findFirst({ where: { email: input.email } })
      if (accessRequest) throw new TRPCError({ code: "BAD_REQUEST", message: "Email already requested access" })
      const success = await createAccessRequest(input.email)

      if (!success) throw new TRPCError({ code: "BAD_REQUEST", message: "Error creating request, please try again" })
      void updateLoopsContact({
        inviteCode: success.code,
        email: input.email,
        accessRequestedAt: new Date().toISOString(),
      })
      sendSlackMessage(`🚀 New in-app access request from ${input.email}${input.reason ? `- reason: ${input.reason}` : ""}`)
      void sendAccessRequestConfirmationEmail(input.email)
      return true
    }),
})
