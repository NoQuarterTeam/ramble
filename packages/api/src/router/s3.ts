import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { createSignedUrl } from "../services/s3.server"

export const s3Router = createTRPCRouter({
  createSignedUrl: protectedProcedure.input(z.object({ key: z.string().min(1) })).mutation(({ input }) => {
    return createSignedUrl(input.key)
  }),
})
