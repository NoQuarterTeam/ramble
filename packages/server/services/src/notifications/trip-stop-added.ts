import { prisma } from "@ramble/database"
import * as Sentry from "@sentry/nextjs"
import { sendMessages } from "./send-messages"

export async function sendTripStopAddedNotification({ initiatorId, tripId }: { tripId: string; initiatorId: string }) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, name: true, users: { select: { id: true }, where: { id: { not: initiatorId } } } },
    })
    if (!trip) return
    const initiator = await prisma.user.findUnique({ where: { id: initiatorId }, select: { username: true } })
    if (!initiator) return
    const tokens = await prisma.pushToken.findMany({
      select: { token: true },
      where: { user: { id: { in: trip.users.map((u) => u.id) } } },
    })

    await sendMessages({
      tokens,
      payload: {
        body: `${initiator.username} added a new stop to your trip: ${trip.name}!`,
        data: { type: "TRIP_STOP_ADDED", tripId: trip.id },
      },
    })

    await prisma.notification.create({
      data: {
        type: "TRIP_STOP_ADDED",
        initiator: { connect: { id: initiatorId } },
        trip: { connect: { id: tripId } },
        userNotifications: { createMany: { data: trip.users.map((user) => ({ userId: user.id })) } },
      },
    })
  } catch (error) {
    Sentry.captureException(error)
  }
}
