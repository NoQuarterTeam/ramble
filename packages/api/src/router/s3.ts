import { randomUUID } from "node:crypto"
import { z } from "zod"

import { assetPrefix, createSignedUrl } from "@ramble/server-services"

import { createTRPCRouter, protectedProcedure } from "../trpc"

export const s3Router = createTRPCRouter({
  /**
   * @deprecated in 1.4.11 - use createSignedUrl
   */
  createSignedUrlNew: protectedProcedure.input(z.object({ type: z.string() })).mutation(async ({ input }) => {
    const uuid = randomUUID()
    const key = `${assetPrefix}${uuid}.${input.type}`
    return { url: await createSignedUrl(key), key }
  }),
  createSignedUrl: protectedProcedure.input(z.object({ type: z.string() })).mutation(async ({ input }) => {
    const uuid = randomUUID()
    const key = `${assetPrefix}${uuid}.${input.type}`
    return { url: await createSignedUrl(key), key }
  }),
})
