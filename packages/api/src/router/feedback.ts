import { z } from "zod"

import { FeedbackType } from "@ramble/database/types"
import { sendSlackMessage } from "@ramble/server-services"

import { createTRPCRouter, publicProcedure } from "../trpc"

export const feedbackRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ message: z.string(), type: z.nativeEnum(FeedbackType) }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user
      await ctx.prisma.feedback.create({ data: { ...input, user: user ? { connect: { id: user.id } } : undefined } })
      const userString = user ? `by @${user.username}` : "by anonymous user"
      sendSlackMessage(`🙏 New feedback submitted (${input.type}) ${userString}: ${input.message}`)
      return true
    }),
})
