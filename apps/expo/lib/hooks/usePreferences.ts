import { z } from "zod"

import { useAsyncStorage } from "./useAsyncStorage"

const preferencesSchema = z.object({
  mapLayerRain: z.boolean(),
  mapStyleSatellite: z.boolean(),
})

type Preferences = z.infer<typeof preferencesSchema>

export const defaultPreferences = {
  mapLayerRain: false,
  mapStyleSatellite: false,
} satisfies Preferences

export function usePreferences() {
  return useAsyncStorage<Preferences>("preferences", defaultPreferences)
}
