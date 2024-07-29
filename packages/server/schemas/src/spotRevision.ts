import { SpotType } from "@ramble/database/server"
import { z } from "zod"
import { NullableFormString } from "./utils/form"

export const spotRevisionSchema = z.object({
  name: z.string().min(1),
  description: NullableFormString,
  isLocationUnknown: z.boolean(),
  address: NullableFormString,
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // isPetFriendly: z.boolean(),
  type: z.nativeEnum(SpotType),
  notes: z.string().min(1),
})
