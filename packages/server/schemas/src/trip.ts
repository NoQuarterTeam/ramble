import { z } from "zod"

export const tripSchema = z.object({
  name: z.string().min(1),
})
