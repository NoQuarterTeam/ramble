import type { ActionArgs } from "@vercel/remix"

import { FormCheckbox, formError, validateFormData } from "~/lib/form"
import { json } from "~/lib/remix.server"

import { createCookie } from "@vercel/remix"
import { z } from "zod"

export const preferencesCookies = createCookie("ramble_preferences", { maxAge: 60 * 60 * 24 * 365 })

export const preferencesSchema = z.object({
  mapLayerRain: FormCheckbox,
})

export type Preferences = z.infer<typeof preferencesSchema>

export const defaultPreferences = {
  mapLayerRain: false,
} satisfies Preferences

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()

  const result = await validateFormData(formData, preferencesSchema)
  if (!result.success) return formError(result)

  console.log(result.data)

  const cookieHeader = request.headers.get("Cookie")
  let cookie = (await preferencesCookies.parse(cookieHeader)) || defaultPreferences

  cookie = { ...cookie, ...result.data }

  return json({ succuess: true }, request, {
    headers: { "Set-Cookie": await preferencesCookies.serialize(cookie) },
  })
}

export const preferencesUrl = "/api/preferences"
