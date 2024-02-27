import { SpotType } from "@ramble/database/types"
import { z } from "zod"
import { FormBoolean, FormNumber, NullableFormString } from "./utils/form"

export const spotRevisionSchema = z.object({
  name: z.string().min(1),
  description: NullableFormString,
  isLocationUnknown: FormBoolean,
  address: NullableFormString,
  latitude: FormNumber,
  longitude: FormNumber,
  // isPetFriendly: FormBoolean,
  type: z.nativeEnum(SpotType),
  notes: z.string().min(1),
})
