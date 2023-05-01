import { Outlet } from "@remix-run/react"
import { redirect } from "@vercel/remix"

import { IS_PRODUCTION } from "~/lib/config.server"

export const loader = () => (IS_PRODUCTION ? redirect("/") : null)

export default function Layout() {
  return <Outlet />
}
