import { z } from "zod"

import { FormNumber, NullableFormString } from "./utils/form"

export const reviewSchema = z.object({
  description: NullableFormString,
  rating: FormNumber.min(1, "Select a rating").max(5),
  spotId: z.string().uuid(),
})

export const reviewTags = z.object({ tagIds: z.array(z.string()).optional() })
