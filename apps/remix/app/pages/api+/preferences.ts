import { track } from "~/lib/analytics.server"
import { formError, validateFormData } from "~/lib/form.server"
import { json } from "~/lib/remix.server"
import type { ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { defaultPreferences, preferencesCookies, preferencesSchema } from "~/services/session/preferences.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await validateFormData(request, preferencesSchema)
  if (!result.success) return formError(result)
  const cookieHeader = request.headers.get("Cookie")
  let cookie = (await preferencesCookies.parse(cookieHeader)) || defaultPreferences

  cookie = { ...cookie, ...result.data }

  track("Map preferences updated", result.data)
  return json({ success: true }, request, {
    headers: { "set-cookie": await preferencesCookies.serialize(cookie) },
  })
}
