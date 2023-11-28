import { z } from "zod"

import { FormNumber } from "./utils/form"

export const reviewSchema = z.object({
  description: z.string().min(10),
  rating: FormNumber.min(1).max(5),
  spotId: z.string().uuid(),
})

export const reviewDataSchema = reviewSchema.pick({ description: true, rating: true })
