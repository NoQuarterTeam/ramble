import { authRouter } from "./router/auth"
import { feedbackRouter } from "./router/feedback"
import { googleRouter } from "./router/google"
import { inviteCodeRouter } from "./router/inviteCode"
import { listRouter } from "./router/list"
import { mapboxRouter } from "./router/mapbox"
import { notificatioRouter } from "./router/notifications"
import { pushTokenRouter } from "./router/pushToken"
import { reviewRouter } from "./router/review"
import { s3Router } from "./router/s3"
import { spotRouter } from "./router/spot"
import { spotRevisionRouter } from "./router/spotRevision"
import { tripRouter } from "./router/trip/trip"
import { userRouter } from "./router/user"
import { vanRouter } from "./router/van"
import { versionRouter } from "./router/version"
import { weatherRouter } from "./router/weather"
import { createTRPCRouter } from "./trpc"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  feedback: feedbackRouter,
  google: googleRouter,
  inviteCode: inviteCodeRouter,
  list: listRouter,
  mapbox: mapboxRouter,
  pushToken: pushTokenRouter,
  review: reviewRouter,
  s3: s3Router,
  notification: notificatioRouter,
  spot: spotRouter,
  spotRevision: spotRevisionRouter,
  trip: tripRouter,
  user: userRouter,
  van: vanRouter,
  version: versionRouter,
  weather: weatherRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
