import { z } from "zod"

// cant use spot type from database package as it imports prisma to browser
export const spotSchemaWithoutType = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  address: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  isPetFriendly: z.boolean(),
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
