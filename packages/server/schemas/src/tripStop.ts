import { z } from "zod"
import { FormNumber } from "./utils/form"

export const tripStopSchema = z.object({
  tripId: z.string(),
  name: z.string().min(1),
  latitude: FormNumber,
  longitude: FormNumber,
  order: FormNumber,
})
