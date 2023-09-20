import { z } from "zod"

export const vanSchema = z.object({
  description: z.string().nullish(),
  name: z.string().min(1),
  model: z.string(),
  year: z.number(),
})
