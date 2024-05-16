import { prisma } from "@ramble/database"

import * as Sentry from "@sentry/nextjs"

import { sendMessages } from "./send-messages"

export async function sendUserFollowedNotification({ initiatorId, userId }: { initiatorId: string; userId: string }) {
  try {
    const tokens = await prisma.pushToken.findMany({ select: { token: true }, where: { user: { id: userId } } })
    const initiator = await prisma.user.findUniqueOrThrow({ where: { id: initiatorId }, select: { username: true } })

    await sendMessages({
      tokens,
      payload: {
        body: `${initiator.username} started following you!`,
        data: { type: "USER_FOLLOWED", username: initiator.username },
      },
    })

    await prisma.notification.create({
      data: {
        type: "USER_FOLLOWED",
        initiator: { connect: { id: initiatorId } },
        userNotifications: { create: { user: { connect: { id: userId } } } },
      },
    })
  } catch (error) {
    Sentry.captureException(error)
  }
}
