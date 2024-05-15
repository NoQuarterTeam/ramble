import { prisma } from "@ramble/database"
import type { User } from "@ramble/database/types"
import * as Sentry from "@sentry/nextjs"

import { sendMessages } from "./send-messages"

export async function sendTripMediaAddedNotification({
  initiatorId,
  tripId,
  username,
}: { tripId: string; initiatorId: string } & Pick<User, "username">) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, name: true, users: { select: { id: true } } },
    })
    if (!trip) return

    const tokens = await prisma.pushToken.findMany({
      select: { token: true },
      where: { user: { id: { in: trip.users.map((u) => u.id) } } },
    })

    await sendMessages({
      tokens,
      payload: {
        body: `${username} added some images and videos to ${trip.name}!`,
        data: { type: "TRIP_MEDIA_ADDED", tripId: trip.id },
      },
    })

    await prisma.notification.create({
      data: {
        type: "TRIP_MEDIA_ADDED",
        initiator: { connect: { id: initiatorId } },
        trip: { connect: { id: tripId } },
        userNotifications: { createMany: { data: trip.users.map((user) => ({ userId: user.id })) } },
      },
    })
  } catch (error) {
    Sentry.captureException(error)
  }
}
