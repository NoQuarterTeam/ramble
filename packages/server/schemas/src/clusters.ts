import { z } from "zod"

import { FormNumber } from "./utils/form"

export const clusterSchema = z.object({
  zoom: FormNumber,
  minLat: FormNumber,
  maxLat: FormNumber,
  minLng: FormNumber,
  maxLng: FormNumber,
})
