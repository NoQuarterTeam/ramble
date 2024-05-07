import { z } from "zod"

import { NullableFormString } from "./utils/form"

export const listSchema = z.object({
  description: NullableFormString,
  name: z.string().min(1),
  isPrivate: z.boolean().optional(),
})
