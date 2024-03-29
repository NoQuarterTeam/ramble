import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { IS_DEV } from "@ramble/server-env"
import { loginSchema, registerSchema } from "@ramble/server-schemas"
import {
  comparePasswords,
  createAccessRequest,
  createAuthToken,
  createToken,
  deleteLoopsContact,
  generateInviteCodes,
  hashPassword,
  sendAccessRequestConfirmationEmail,
  sendAccountVerificationEmail,
  sendSlackMessage,
  updateLoopsContact,
} from "@ramble/server-services"

import dayjs from "dayjs"
import { createTRPCRouter, publicProcedure } from "../trpc"

export const authRouter = createTRPCRouter({
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const isSamePassword = comparePasswords(input.password, user.password)
    if (!isSamePassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const token = createAuthToken({ id: user.id })
    return {
      user: {
        ...user,
        trialExpiresAt: !user.trialExpiresAt ? dayjs(user.createdAt).add(1, "month").toDate() : user.trialExpiresAt,
      },
      token,
    }
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
    return {
      user: {
        ...user,
        trialExpiresAt: !user.trialExpiresAt ? dayjs(user.createdAt).add(1, "month").toDate() : user.trialExpiresAt,
      },
      token,
    }
  }),
  requestAccess: publicProcedure
    .input(
      z.object({
        email: z
          .string()
          .email()
          .transform((e) => e.toLowerCase().trim()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const accessRequest = await ctx.prisma.accessRequest.findFirst({ where: { email: input.email } })
      if (accessRequest) throw new TRPCError({ code: "BAD_REQUEST", message: "Email already requested access" })
      const success = await createAccessRequest(input.email)
      if (!success) throw new TRPCError({ code: "BAD_REQUEST", message: "Error creating request, please try again" })
      sendSlackMessage(`🚀 New in-app access request from ${input.email}`)
      void sendAccessRequestConfirmationEmail(input.email)
      return true
    }),
})
