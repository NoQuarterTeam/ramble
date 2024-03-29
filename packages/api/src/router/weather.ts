import { get5DayForecast, getCurrentWeather } from "@ramble/server-services"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"

export const weatherRouter = createTRPCRouter({
  getSpotPreviewForecast: publicProcedure.input(z.object({ spotId: z.string() })).query(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({ where: { id: input.spotId } })
    if (!spot) return
    return await getCurrentWeather(spot?.latitude, spot?.longitude)
  }),
  getSpotDetailForecast: publicProcedure.input(z.object({ spotId: z.string() })).query(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({ where: { id: input.spotId } })
    if (!spot) return
    return await get5DayForecast(spot?.latitude, spot?.longitude)
  }),
})
