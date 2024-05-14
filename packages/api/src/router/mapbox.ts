import { geocodeAddress, geocodeCoords, getPlaces } from "@ramble/server-services"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"

export const mapboxRouter = createTRPCRouter({
  geocodeCoords: publicProcedure.input(z.object({ latitude: z.number(), longitude: z.number() })).query(({ input }) => {
    return geocodeCoords({ latitude: input.latitude, longitude: input.longitude })
  }),
  geocodeAddress: publicProcedure.input(z.object({ address: z.string() })).query(({ input }) => {
    return geocodeAddress({ address: input.address })
  }),
  getPlaces: publicProcedure.input(z.object({ search: z.string() })).query(({ input }) => {
    return getPlaces({ search: input.search })
  }),
})
