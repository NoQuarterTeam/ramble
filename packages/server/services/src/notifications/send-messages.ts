import type { PushToken } from "@ramble/database/types"
import type { NotificationPayload } from "@ramble/shared"
import { Expo, type ExpoPushMessage } from "expo-server-sdk"
import { expo } from "../lib/expo"

export async function sendMessages({
  tokens,
  payload: { title = "Ramble", ...payload },
}: { tokens: Pick<PushToken, "token">[]; payload: Omit<ExpoPushMessage, "to"> & { data: NotificationPayload } }) {
  const messages = tokens
    .map((t) => t.token)
    .filter(Expo.isExpoPushToken)
    .map((token) => ({ ...payload, to: token }) satisfies ExpoPushMessage)

  const chunks = expo.chunkPushNotifications(messages)

  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk)
  }
}
