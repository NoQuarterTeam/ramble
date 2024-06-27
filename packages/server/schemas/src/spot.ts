import { z } from "zod"

import { SpotType } from "@ramble/database/server"

import { NullableFormString } from "./utils/form"

// cant use spot type from database package as it imports prisma to browser
export const spotSchema = z.object({
  name: z.string().min(1),
  description: NullableFormString,
  address: NullableFormString,
  latitude: z.number(),
  longitude: z.number(),
  // temp until apps send correct data
  isPetFriendly: z.union([z.boolean(), z.string()]),
  type: z.nativeEnum(SpotType),
})

export const spotAmenitiesSchema = z.object({
  hotWater: z.boolean(),
  wifi: z.boolean(),
  shower: z.boolean(),
  toilet: z.boolean(),
  kitchen: z.boolean(),
  electricity: z.boolean(),
  water: z.boolean(),
  firePit: z.boolean(),
  sauna: z.boolean(),
  pool: z.boolean(),
  bbq: z.boolean(),
})
