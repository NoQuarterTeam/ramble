import { createTRPCRouter, protectedProcedure } from "../trpc"

/**
 * @deprecated in 1.5.0 - no longer used
 */
export const inviteCodeRouter = createTRPCRouter({
  /**
   * @deprecated in 1.5.0 - no longer used
   */
  myCodes: protectedProcedure.query(() => {
    return []
  }),
})
