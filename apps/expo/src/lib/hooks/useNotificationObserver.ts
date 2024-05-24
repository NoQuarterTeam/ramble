import type { NotificationPayload } from "@ramble/shared"
import * as Notifications from "expo-notifications"
import { router } from "expo-router"
import * as React from "react"

export function useNotificationObserver() {
  React.useEffect(() => {
    let isMounted = true
    function redirect(notification: Notifications.Notification) {
      const payload = notification.request.content.data as NotificationPayload
      if (!payload) return

      switch (payload.type) {
        case "USER_FOLLOWED":
          return router.push(`/${payload.username}/`)
        case "TRIP_SPOT_ADDED":
        case "TRIP_STOP_ADDED":
        case "TRIP_MEDIA_ADDED":
          return router.push(`/trip/${payload.tripId}/`)
        case "SPOT_VERIFIED":
        case "SPOT_ADDED_TO_LIST":
        case "SPOT_ADDED_TO_TRIP":
        case "SPOT_REVIEWED":
          return router.push(`/spot/${payload.spotId}/`)
        default:
          break
      }
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
