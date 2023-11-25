import { z } from "zod"

import { SpotType } from "@ramble/database/types"
import { doesSpotTypeRequireDescription } from "@ramble/shared"

import { FormBoolean, FormNumber, NullableFormString } from "./utils/form"

// cant use spot type from database package as it imports prisma to browser
export const spotSchema = z
  .object({
    name: z.string().min(1),
    description: NullableFormString,
    address: NullableFormString,
    latitude: FormNumber,
    longitude: FormNumber,
    isPetFriendly: FormBoolean,
    type: z.nativeEnum(SpotType),
  })
  .refine(
    (data) => {
      if (doesSpotTypeRequireDescription(data.type) && (!data.description || data.description.length < 50)) return false
      return true
    },
    { message: "Description must be at least 50 characters long", path: ["description"] },
  )

export const spotAmenitiesSchema = z.object({
  hotWater: FormBoolean,
  wifi: FormBoolean,
  shower: FormBoolean,
  toilet: FormBoolean,
  kitchen: FormBoolean,
  electricity: FormBoolean,
  water: FormBoolean,
  firePit: FormBoolean,
  sauna: FormBoolean,
  pool: FormBoolean,
  bbq: FormBoolean,
})
