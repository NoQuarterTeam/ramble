import type { Prisma, Van } from "@ramble/database/types"

export const VAN_SETTINGS = {
  hasToilet: "Toilet onboard",
  hasShower: "Shower onboard",
  hasElectricity: "Off-grid electricity",
  hasInternet: "Access to internet",
  hasBikeRack: "Mounted bike rack",
} as {
  [key in keyof Omit<
    Van,
    "id" | "createdAt" | "updatedAt" | "spotId" | "name" | "model" | "year" | "description" | "userId"
  >]: string
}

export const vanSettingsFields = {
  hasBikeRack: true,
  hasElectricity: true,
  hasInternet: true,
  hasShower: true,
  hasToilet: true,
} satisfies Prisma.VanSelect
