import { z } from "zod"

export const reviewSchema = z.object({
  description: z.string().nullable(),
  rating: z.number().min(1, "Select a rating").max(5),
  spotId: z.string().uuid(),
})

export const reviewTags = z.object({ tagIds: z.array(z.string()).optional() })
