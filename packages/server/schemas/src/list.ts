import { z } from "zod"

import { FormBoolean, NullableFormString } from "./utils/form"

export const listSchema = z.object({
  description: NullableFormString,
  name: z.string().min(1),
  isPrivate: FormBoolean,
})
