import { Outlet } from "@remix-run/react"
import type { LinksFunction, LoaderArgs, SerializeFrom } from "@vercel/remix"
import { json } from "@vercel/remix"
import mapStyles from "mapbox-gl/dist/mapbox-gl.css"
import { cacheHeader } from "pretty-cache-header"

import { getIpInfo } from "~/services/ip.server"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: mapStyles }]
}

export const loader = async ({ request }: LoaderArgs) => {
  const ipInfo = await getIpInfo(request)
  return json(ipInfo, {
    headers: {
      "Cache-Control": cacheHeader({
        private: true,
        maxAge: "10hour",
        sMaxage: "20hour",
        staleWhileRevalidate: "1day",
        staleIfError: "1day",
      }),
    },
  })
}
export type IpInfo = SerializeFrom<typeof loader>
export const shouldRevalidate = () => false

export default function App() {
  return (
    <>
      <Outlet />
    </>
  )
}
