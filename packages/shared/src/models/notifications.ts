import type { NotificationType } from "@ramble/database/types"

type NotificationPayloadType = {
  type: NotificationType
  [key: string]: string
}

interface UserFollowedPayload extends NotificationPayloadType {
  type: "USER_FOLLOWED"
  username: string
}
interface TripSpotAddedPayload extends NotificationPayloadType {
  type: "TRIP_SPOT_ADDED"
  tripId: string
}
interface TripStopAddedPayload extends NotificationPayloadType {
  type: "TRIP_STOP_ADDED"
  tripId: string
}
interface TripMediaAddedPayload extends NotificationPayloadType {
  type: "TRIP_MEDIA_ADDED"
  tripId: string
}
interface SpotVerifiedPayload extends NotificationPayloadType {
  type: "SPOT_VERIFIED"
  spotId: string
}
interface SpotAddedToListPayload extends NotificationPayloadType {
  type: "SPOT_ADDED_TO_LIST"
  spotId: string
}
interface SpotAddedToTripPayload extends NotificationPayloadType {
  type: "SPOT_ADDED_TO_TRIP"
  spotId: string
}
interface SpotReviewedPayload extends NotificationPayloadType {
  type: "SPOT_REVIEWED"
  spotId: string
}

export type NotificationPayload =
  | UserFollowedPayload
  | TripSpotAddedPayload
  | TripStopAddedPayload
  | TripMediaAddedPayload
  | SpotVerifiedPayload
  | SpotAddedToListPayload
  | SpotAddedToTripPayload
  | SpotReviewedPayload
