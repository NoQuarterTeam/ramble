import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { IS_DEV } from "@ramble/server-env"
import { loginSchema, registerSchema } from "@ramble/server-schemas"
import {
  comparePasswords,
  createAccessRequest,
  createAuthToken,
  deleteLoopsContact,
  generateInviteCodes,
  hashPassword,
  sendAccessRequestConfirmationEmail,
  sendSlackMessage,
  updateLoopsContact,
} from "@ramble/server-services"

import { createTRPCRouter, publicProcedure } from "../trpc"

export const authRouter = createTRPCRouter({
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const isSamePassword = comparePasswords(input.password, user.password)
    if (!isSamePassword) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect email or password" })
    const token = createAuthToken({ id: user.id })
    return { user, token }
  }),
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input: { code, ...input } }) => {
    const existingEmail = await ctx.prisma.user.findUnique({ where: { email: input.email } })
    if (existingEmail) throw new TRPCError({ code: "BAD_REQUEST", message: "Email already in use" })

    const accessRequest = await ctx.prisma.accessRequest.findFirst({ where: { code, user: null } })
    const inviteCode = await ctx.prisma.inviteCode.findFirst({ where: { code, acceptedAt: null } })
    if (!IS_DEV) {
      if (!accessRequest && !inviteCode) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid code" })
    }

    const existingUsername = await ctx.prisma.user.findUnique({ where: { username: input.username } })
    if (existingUsername) throw new TRPCError({ code: "BAD_REQUEST", message: "User with this username already exists" })
    const hashedPassword = hashPassword(input.password)
    const user = await ctx.prisma.user.create({
      data: {
        ...input,
        isVerified: true, // temp
        lists: { create: { name: "Favourites", description: "All my favourite spots" } },
        password: hashedPassword,
      },
    })
    if (accessRequest) {
      await ctx.prisma.accessRequest.update({
        where: { id: accessRequest.id },
        data: { acceptedAt: new Date(), user: { connect: { id: user.id } } },
      })
    }
    if (inviteCode) {
      await ctx.prisma.inviteCode.update({
        where: { id: inviteCode.id },
        data: { acceptedAt: new Date(), user: { connect: { id: user.id } } },
      })
    }
    const codes = generateInviteCodes(user.id)
    await ctx.prisma.inviteCode.createMany({ data: codes.map((c) => ({ code: c, ownerId: user.id })) })
    const token = createAuthToken({ id: user.id })
    if (accessRequest && accessRequest.email !== user.email) {
      void deleteLoopsContact({ email: accessRequest.email })
    }
    void updateLoopsContact({ ...user, signedUpAt: user.createdAt.toISOString(), userGroup: "beta", userId: user.id })
    void sendSlackMessage(`🔥 @${user.username} signed up!`)
    return { user: user, token }
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
