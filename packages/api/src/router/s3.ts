import { randomUUID } from "node:crypto"
import { z } from "zod"

import { createSignedUrl } from "@ramble/server-services"

import { assetPrefix } from "@ramble/shared"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const s3Router = createTRPCRouter({
  /**
   * @deprecated use createSignedUrlNew
   */
  createSignedUrl: protectedProcedure.input(z.object({ key: z.string().min(1) })).mutation(({ input }) => {
    return createSignedUrl(input.key)
  }),
  createSignedUrlNew: protectedProcedure.input(z.object({ type: z.string() })).mutation(async ({ input }) => {
    const uuid = randomUUID()
    const key = `${assetPrefix}${uuid}.${input.type}`
    return { url: await createSignedUrl(key), key }
  }),
})
