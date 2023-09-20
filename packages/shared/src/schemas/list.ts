import { z } from "zod"

export const listSchema = z.object({
  description: z.string().nullish(),
  name: z.string().min(1),
  isPrivate: z.boolean(),
})
