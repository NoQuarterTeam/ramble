import { z } from "zod"
import { FormBoolean, FormNumber, NullableFormString } from "./utils/form"
import { SpotType } from "@ramble/database/types"
import { doesSpotTypeRequireDescription } from "@ramble/shared"

export const spotRevisionSchema = z
  .object({
    name: z.string().min(1),
    description: NullableFormString,
    address: NullableFormString,
    latitude: FormNumber,
    longitude: FormNumber,
    isPetFriendly: FormBoolean,
    type: z.nativeEnum(SpotType),
    notes: z.string(),
  })
  .refine(
    (data) => {
      if (doesSpotTypeRequireDescription(data.type) && (!data.description || data.description.length < 50)) return false
      return true
    },
    { message: "Description must be at least 50 characters long", path: ["description"] },
  )
