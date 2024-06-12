import { prisma } from "@ramble/database"
import * as Sentry from "@sentry/nextjs"
import dayjs from "dayjs"
import { sendMessages } from "./send-messages"

export async function sendUserFollowedNotification({ initiatorId, userId }: { initiatorId: string; userId: string }) {
  try {
    const tokens = await prisma.pushToken.findMany({ select: { token: true }, where: { user: { id: userId } } })
    const initiator = await prisma.user.findUnique({ where: { id: initiatorId }, select: { username: true } })
    if (!initiator) return

    const existingFollowNotifications = await prisma.notification.findMany({
      take: 1,
      select: { id: true },
      where: {
        createdAt: { gt: dayjs().subtract(1, "day").toDate() },
        type: "USER_FOLLOWED",
        initiatorId,
        userNotifications: { some: { userId } },
      },
    })
    if (existingFollowNotifications.length > 0) return

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
