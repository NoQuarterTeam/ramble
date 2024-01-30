import { Outlet, ShouldRevalidateFunction } from "@remix-run/react"

import { json, redirect } from "~/lib/remix.server"
import { type SerializeFrom, type LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { type MapLayers, defaultMapLayers, mapLayersCookies } from "~/pages/api+/map-layers"
import { getUserSession } from "~/services/session/session.server"
import { mapLayersUrl } from "./components/MapLayerControls"

export const shouldRevalidate: ShouldRevalidateFunction = ({ formAction }) => {
  return formAction === mapLayersUrl
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { userId } = await getUserSession(request)
  const url = new URL(request.url)
  const cookieHeader = request.headers.get("Cookie")

  if (!userId && url.pathname !== "/") throw redirect("/")
  const mapLayers: MapLayers = await mapLayersCookies.parse(cookieHeader)
  return json({ mapLayers: mapLayers || defaultMapLayers })
}

export default Outlet

export type AppLayoutLoader = SerializeFrom<typeof loader>
