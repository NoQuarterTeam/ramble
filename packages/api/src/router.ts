import { authRouter } from "./router/auth"
import { spotRouter } from "./router/spot"
import { userRouter } from "./router/user"
import { listRouter } from "./router/list"
import { createTRPCRouter } from "./trpc"
import { reviewRouter } from "./router/review"
import { vanRouter } from "./router/van"
import { s3Router } from "./router/s3"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  spot: spotRouter,
  list: listRouter,
  review: reviewRouter,
  van: vanRouter,
  s3: s3Router,
})

// export type definition of API
export type AppRouter = typeof appRouter
