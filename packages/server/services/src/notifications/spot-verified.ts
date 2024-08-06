import { prisma } from "@ramble/database"
import * as Sentry from "@sentry/nextjs"
import { sendMessages } from "./send-messages"
import { isPartnerSpot, spotPartnerFields } from '@ramble/shared';

export async function sendSpotVerifiedNotification({ initiatorId, spotId }: { spotId: string; initiatorId: string }) {
  try {
    const spot = await prisma.spot.findUnique({
      where: { id: spotId },
      select: { id: true, name: true, creatorId: true, ...spotPartnerFields },
    })
    if (!spot) return
    if (!spot || !isPartnerSpot(spot)) return

    const initiator = await prisma.user.findUnique({ where: { id: initiatorId }, select: { username: true } })
    if (!initiator || initiatorId === spot.creatorId) return

    const tokens = await prisma.pushToken.findMany({
      select: { token: true },
      where: { user: { id: spot.creatorId } },
    })

    await sendMessages({
      tokens,
      payload: {
        body: `${initiator.username} verified your spot: ${spot.name}!`,
        data: { type: "SPOT_VERIFIED", spotId: spot.id },
      },
    })

    await prisma.notification.create({
      data: {
        type: "SPOT_VERIFIED",
        initiator: { connect: { id: initiatorId } },
        spot: { connect: { id: spotId } },
        userNotifications: { create: { userId: spot.creatorId } },
      },
    })
  } catch (error) {
    Sentry.captureException(error)
  }
}
