import { createTRPCRouter, publicProcedure } from "../trpc"

export const versionRouter = createTRPCRouter({
  latest: publicProcedure.query(() => {
    return 1
  }),
})
