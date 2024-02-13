import { authRouter } from "./router/auth"
import { feedbackRouter } from "./router/feedback"
import { inviteCodeRouter } from "./router/inviteCode"
import { listRouter } from "./router/list"
import { mapboxRouter } from "./router/mapbox"
import { reviewRouter } from "./router/review"
import { s3Router } from "./router/s3"
import { spotRouter } from "./router/spot"
import { spotRevisionRouter } from "./router/spotRevision"
import { tripRouter } from "./router/trip"
import { userRouter } from "./router/user"
import { vanRouter } from "./router/van"
import { createTRPCRouter } from "./trpc"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  feedback: feedbackRouter,
  inviteCode: inviteCodeRouter,
  list: listRouter,
  trip: tripRouter,
  review: reviewRouter,
  s3: s3Router,
  spot: spotRouter,
  mapbox: mapboxRouter,
  spotRevision: spotRevisionRouter,
  user: userRouter,
  van: vanRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
