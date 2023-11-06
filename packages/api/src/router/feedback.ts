import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { vanSchema } from "@ramble/shared"

import { createTRPCRouter, protectedProcedure } from "../trpc"
import { FeedbackType } from "@ramble/database/types"
import { sendFeedbackSentToAdminsEmail } from "../services/mailers/feedback.server"
import { sendSlackMessage } from "../services/slack.server"

export const feedbackRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ message: z.string(), type: z.nativeEnum(FeedbackType) }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user
      const feedback = await ctx.prisma.feedback.create({ data: { ...input, userId: user.id }, include: { user: true } })
      const admins = await ctx.prisma.user.findMany({ where: { isAdmin: true }, select: { email: true } })
      await sendFeedbackSentToAdminsEmail(
        admins.map((a) => a.email),
        feedback,
      )
      sendSlackMessage(`🙏 New feedback submitted (${input.type}) by @${user.username}: ` + input.message)
      return true
    }),
})
