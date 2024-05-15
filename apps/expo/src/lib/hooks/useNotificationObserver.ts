import type { NotificationPayload } from "@ramble/shared"
import * as Notifications from "expo-notifications"
import { type Href, router } from "expo-router"
import * as React from "react"

export function useNotificationObserver() {
  React.useEffect(() => {
    let isMounted = true

    function redirect(notification: Notifications.Notification) {
      const payload = notification.request.content.data as NotificationPayload
      if (!payload) return
      // TODO: figure out how to properly type urls
      let url: Href<string> = "/"
      switch (payload.type) {
        case "USER_FOLLOWED":
          url = `/${payload.username}` as Href<string>
          break
        case "TRIP_SPOT_ADDED":
        case "TRIP_STOP_ADDED":
        case "TRIP_MEDIA_ADDED":
          url = `/trips/${payload.tripId}` as Href<string>
          break
        default:
          break
      }
      router.push(url)
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) return
      redirect(response?.notification)
    })

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response.notification)
    })

    return () => {
      isMounted = false
      subscription.remove()
    }
  }, [])
}
