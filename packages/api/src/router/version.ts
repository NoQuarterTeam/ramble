import semver from "semver"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"

const MIN_SUPPORTED_VERSION = "1.5.0"

export const versionRouter = createTRPCRouter({
  isSupported: publicProcedure.input(z.object({ version: z.string() })).query(({ input }) => {
    if (semver.valid(input.version) === null) return false
    return semver.gte(input.version, MIN_SUPPORTED_VERSION)
  }),
})
