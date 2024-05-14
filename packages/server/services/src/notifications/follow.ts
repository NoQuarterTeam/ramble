import type { User } from "@ramble/database/types"
import * as Sentry from "@sentry/nextjs"
import { waitUntil } from "@vercel/functions"
import { Expo, type ExpoPushMessage } from "expo-server-sdk"
import { expo } from "../lib/expo"

export function sendFollowNotification({ tokens, username }: { tokens: string[] } & Pick<User, "username">) {
  const run = async () => {
    const body = `${username} started following you!`
    const url = `/${username}`

    const messages = tokens
      .filter(Expo.isExpoPushToken)
      .map((token) => ({ to: token, body, data: { url } }) satisfies ExpoPushMessage)
    const chunks = expo.chunkPushNotifications(messages)

    for await (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk)
    }
  }
  waitUntil(run().catch(Sentry.captureException))
}
