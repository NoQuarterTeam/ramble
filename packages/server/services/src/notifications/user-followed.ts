import { prisma } from "@ramble/database"
import type { User } from "@ramble/database/types"
import * as Sentry from "@sentry/nextjs"

import { sendMessages } from "./send-messages"

export async function sendUserFollowedNotification({ initiatorId, username }: { initiatorId: string } & Pick<User, "username">) {
  try {
    const tokens = await prisma.pushToken.findMany({ select: { token: true }, where: { user: { username: username } } })

    await sendMessages({
      tokens,
      payload: { body: `${username} started following you!`, data: { type: "USER_FOLLOWED", username } },
    })

    await prisma.notification.create({
      data: {
        type: "USER_FOLLOWED",
        initiator: { connect: { id: initiatorId } },
        userNotifications: { create: { user: { connect: { username: username } } } },
      },
    })
  } catch (error) {
    Sentry.captureException(error)
  }
}
