import { z } from "zod"
import { FormNumber } from "./utils/form"

export const tripStopSchema = z.object({
  name: z.string().min(1),
  latitude: FormNumber,
  longitude: FormNumber,
})
