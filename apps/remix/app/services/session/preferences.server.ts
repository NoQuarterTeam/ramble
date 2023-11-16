import { z } from "zod"

import { FormCheckbox } from "~/lib/form.server"
import { createCookie } from "~/lib/vendor/vercel.server"

export const preferencesCookies = createCookie("ramble_preferences", { maxAge: 60 * 60 * 24 * 365 })

export const preferencesSchema = z.object({
  mapLayerRain: FormCheckbox,
  mapLayerTemp: FormCheckbox,
  mapStyleSatellite: FormCheckbox,
})

export type Preferences = z.infer<typeof preferencesSchema>

export const defaultPreferences = {
  mapLayerRain: false,
  mapLayerTemp: false,
  mapStyleSatellite: false,
} satisfies Preferences
