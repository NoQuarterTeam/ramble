import { MediaType } from "@ramble/database/types"
import { z } from "zod"

export const tripSchema = z.object({
  name: z.string().min(1),
  startDate: z.date(),
  endDate: z.date(),
})

export const tripMediaSchema = z.object({
  path: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  assetId: z.string(),
  timestamp: z.date(),
  type: z.nativeEnum(MediaType),
  duration: z.number().nullable(),
  thumbnailPath: z.string().nullable(),
})
