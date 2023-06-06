import { authRouter } from "./router/auth"
import { spotRouter } from "./router/spot"
import { userRouter } from "./router/user"
import { createTRPCRouter } from "./trpc"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  spot: spotRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
