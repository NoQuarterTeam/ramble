import { z } from "zod"

export const clusterSchema = z.object({
  zoom: z.number(),
  minLat: z.number(),
  maxLat: z.number(),
  minLng: z.number(),
  maxLng: z.number(),
})
