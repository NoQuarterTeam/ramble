import { authRouter } from "./router/auth"
import { spotRouter } from "./router/spot"
import { userRouter } from "./router/user"
import { listRouter } from "./router/list"
import { createTRPCRouter } from "./trpc"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  spot: spotRouter,
  list: listRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
