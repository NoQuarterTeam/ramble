import { z } from "zod"

import { NullableFormString } from "./utils/form"

export const vanSchema = z.object({
  name: z.string().min(1),
  model: z.string(),
  year: z.union([
    z
      .number()
      .min(1950)
      .max(new Date().getFullYear() + 5),
    z.string(),
  ]),
  description: NullableFormString,
})
