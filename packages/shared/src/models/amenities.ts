import { type Prisma, type SpotAmenities } from "@ramble/database/types"

export const AMENITIES = {
  bbq: "BBQ",
  electricity: "Electricity",
  water: "Water",
  toilet: "Toilet",
  shower: "Shower",
  wifi: "Wifi",
  kitchen: "Kitchen",
  pool: "Pool",
  hotWater: "Hot water",
  firePit: "Fire pit",
  sauna: "Sauna",
} as { [key in keyof Omit<SpotAmenities, "id" | "createdAt" | "updatedAt" | "spotId">]: string }

export const amenitiesFields = {
  bbq: true,
  electricity: true,
  water: true,
  toilet: true,
  shower: true,
  wifi: true,
  kitchen: true,
  pool: true,
  hotWater: true,
  firePit: true,
  sauna: true,
} satisfies Prisma.SpotAmenitiesSelect
