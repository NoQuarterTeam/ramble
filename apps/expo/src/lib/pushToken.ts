import * as Sentry from "@sentry/react-native"
import Constants from "expo-constants"
import * as Notifications from "expo-notifications"
import { isAndroid } from "./device"

export async function getPushToken() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== "granted") return null
    const token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig!.extra!.eas.projectId })).data
    if (isAndroid) {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      })
    }
    return token
  } catch (error) {
    Sentry.captureException(error)
    return null
  }
}
