import { authRouter } from "./router/auth"
import { spotRouter } from "./router/spot"
import { createTRPCRouter } from "./trpc"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  spot: spotRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
