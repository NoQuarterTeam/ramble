import { getCurrentWeather } from "@ramble/server-services"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"

export const weatherRouter = createTRPCRouter({
  byCoords: publicProcedure.input(z.object({ latitude: z.number(), longitude: z.number() })).query(({ input }) => {
    return getCurrentWeather(input.latitude, input.longitude)
  }),
})
