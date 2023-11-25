import { z } from "zod"

import { FeedbackType } from "@ramble/database/types"
import { sendSlackMessage } from "@ramble/server-services"

import { createTRPCRouter, protectedProcedure } from "../trpc"

export const feedbackRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ message: z.string(), type: z.nativeEnum(FeedbackType) }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user
      await ctx.prisma.feedback.create({ data: { ...input, userId: user.id }, include: { user: true } })
      sendSlackMessage(`🙏 New feedback submitted (${input.type}) by @${user.username}: ` + input.message)
      return true
    }),
})
