import { z } from "zod"

export const tripStopSchema = z.object({
  name: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
})
