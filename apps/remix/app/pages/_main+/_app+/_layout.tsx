import { Outlet, type ShouldRevalidateFunction } from "@remix-run/react"

import { json } from "~/lib/remix.server"
import type { LoaderFunctionArgs, SerializeFrom } from "~/lib/vendor/vercel.server"
import { type MapLayers, defaultMapLayers, mapLayersCookies } from "~/pages/api+/map-layers"

import { requireUser } from "~/services/auth/auth.server"
import { mapLayersUrl } from "./components/MapLayerControls"

export const shouldRevalidate: ShouldRevalidateFunction = ({ formAction }) => {
  return formAction === mapLayersUrl
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUser(request)
  const cookieHeader = request.headers.get("Cookie")
  const mapLayers: MapLayers = await mapLayersCookies.parse(cookieHeader)
  return json({ mapLayers: mapLayers || defaultMapLayers })
}

export default Outlet

export type AppLayoutLoader = SerializeFrom<typeof loader>
