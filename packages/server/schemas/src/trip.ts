import { MediaType } from "@ramble/database/server"
import { z } from "zod"

export const tripSchema = z.object({
  name: z.string().min(1),
  startDate: z.date(),
  endDate: z.date(),
  mediaSyncEnabled: z.boolean().optional(),
})

export const tripMediaSchema = z.object({
  path: z.string(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  assetId: z.string(),
  timestamp: z.date(),
  type: z.nativeEnum(MediaType).optional(), // todo: remove optional eventually
  duration: z.number().nullish(),
  thumbnailPath: z.string().nullish(),
})
