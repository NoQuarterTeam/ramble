import type { ActionFunctionArgs } from "@vercel/remix"
import { createCookie } from "@vercel/remix"
import { z } from "zod"

import { FormCheckbox, formError, validateFormData } from "~/lib/form"
import { json } from "~/lib/remix.server"

export const preferencesCookies = createCookie("ramble_preferences", { maxAge: 60 * 60 * 24 * 365 })

export const preferencesSchema = z.object({
  mapLayerRain: FormCheckbox,
  mapLayerTemp: FormCheckbox,
})

export type Preferences = z.infer<typeof preferencesSchema>

export const defaultPreferences = {
  mapLayerRain: false,
  mapLayerTemp: false,
} satisfies Preferences

export async function action({ request }: ActionFunctionArgs) {
  const result = await validateFormData(request, preferencesSchema)
  if (!result.success) return formError(result)
  const cookieHeader = request.headers.get("Cookie")
  let cookie = (await preferencesCookies.parse(cookieHeader)) || defaultPreferences

  cookie = { ...cookie, ...result.data }

  return json({ success: true }, request, {
    headers: { "set-cookie": await preferencesCookies.serialize(cookie) },
  })
}

export const preferencesUrl = "/api/preferences"
