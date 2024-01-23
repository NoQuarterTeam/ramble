import { z } from "zod"

import { useAsyncStorage } from "./useAsyncStorage"

const preferencesSchema = z.object({
  mapLayerRain: z.boolean(),
  mapLayerTemp: z.boolean(),
  mapStyleSatellite: z.boolean(),
  mapUsers: z.boolean(),
})

type Preferences = z.infer<typeof preferencesSchema>

export const defaultPreferences = {
  mapLayerRain: false,
  mapLayerTemp: false,
  mapStyleSatellite: false,
  mapUsers: false,
} satisfies Preferences

export function usePreferences() {
  return useAsyncStorage<Preferences>("preferences", defaultPreferences)
}
