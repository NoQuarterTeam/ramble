import { z } from "zod"

export const reviewSchema = z.object({
  description: z.string().min(50),
  rating: z.number().min(1).max(5),
  spotId: z.string().uuid(),
})
