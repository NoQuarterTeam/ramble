import { z } from "zod"

import { FormNumber, NullableFormString } from "./utils/form"

export const vanSchema = z.object({
  name: z.string().min(1),
  model: z.string(),
  year: FormNumber.min(1950).max(new Date().getFullYear() + 5),
  description: NullableFormString,
})
