import { z } from "zod"

import { SpotType } from "@ramble/database/types"
import { geocodeAddress, geocodeCoords, getPlaces } from "@ramble/server-services"

import { createTRPCRouter, publicProcedure } from "../trpc"

export type SpotClusterTypes = { [key in SpotType]?: number }

export const mapboxRouter = createTRPCRouter({
  geocodeCoords: publicProcedure.input(z.object({ latitude: z.number(), longitude: z.number() })).query(async ({ input }) => {
    return geocodeCoords({ latitude: input.latitude, longitude: input.longitude })
  }),
  geocodeAddress: publicProcedure.input(z.object({ address: z.string() })).query(async ({ input }) => {
    return geocodeAddress({ address: input.address })
  }),
  getPlaces: publicProcedure.input(z.object({ search: z.string() })).query(async ({ input }) => {
    return getPlaces({ search: input.search })
  }),
})
