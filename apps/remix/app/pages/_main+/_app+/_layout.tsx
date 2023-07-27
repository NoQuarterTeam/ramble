import "mapbox-gl/dist/mapbox-gl.css"
import type { Geo } from "@vercel/edge"
import { geolocation } from "@vercel/edge"
import { cssBundleHref } from "@remix-run/css-bundle"
import { Outlet } from "@remix-run/react"
import type { LinksFunction, LoaderArgs, SerializeFrom } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

export const config = {
  runtime: "edge",
}

export const links: LinksFunction = () => {
  return cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []
}

export const loader = async ({ request }: LoaderArgs) => {
  const geo = geolocation(request) as Geo | undefined
  if (!geo) return json({ latitude: null, longitude: null, city: null, country: null })
  return json(
    {
      latitude: geo.latitude ? parseFloat(geo.latitude) : null,
      longitude: geo.longitude ? parseFloat(geo.longitude) : null,
      city: geo.city,
      country: geo.country,
    },
    {
      headers: {
        "Cache-Control": cacheHeader({
          private: true,
          maxAge: "10hour",
          sMaxage: "20hour",
          staleWhileRevalidate: "1day",
          staleIfError: "1day",
        }),
      },
    },
  )
}
export type IpInfo = SerializeFrom<typeof loader> | undefined
export const shouldRevalidate = () => false

export default function App() {
  return <Outlet />
}
