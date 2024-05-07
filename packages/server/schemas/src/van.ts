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
    /**
     * @deprecated in 1.4.11, use number instead and remove union
     */
    z.string(),
  ]),
  description: NullableFormString,
  hasToilet: z.boolean().optional(),
  hasShower: z.boolean().optional(),
  hasElectricity: z.boolean().optional(),
  hasInternet: z.boolean().optional(),
  hasBikeRack: z.boolean().optional(),
})
