import { track } from "~/lib/analytics.server"
import { formError, validateFormData } from "~/lib/form.server"
import { json } from "~/lib/remix.server"
import type { ActionFunctionArgs } from "~/lib/vendor/vercel.server"

import { z } from "zod"
import { CheckboxAsString } from "zodix"

import { createCookie } from "~/lib/vendor/vercel.server"

export const mapLayersCookies = createCookie("ramble_map_layers", { maxAge: 60 * 60 * 24 * 365 })

export const mapLayersSchema = z.object({
  layer: z.preprocess(
    (v) => (v === "" ? null : v),
    z.union([z.literal("rain"), z.literal("temp"), z.literal("satellite")]).nullish(),
  ),
  shouldShowUsers: CheckboxAsString,
})

export type MapLayers = z.infer<typeof mapLayersSchema>

export const defaultMapLayers = {
  layer: null,
  shouldShowUsers: true,
} satisfies MapLayers

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await validateFormData(request, mapLayersSchema)
  if (!result.success) return formError(result)
  const cookieHeader = request.headers.get("Cookie")
  let cookie = (await mapLayersCookies.parse(cookieHeader)) || defaultMapLayers
  cookie = { ...cookie, ...result.data }
  track("Map layers updated", result.data)
  return json({ success: true }, request, {
    headers: { "set-cookie": await mapLayersCookies.serialize(cookie) },
  })
}
