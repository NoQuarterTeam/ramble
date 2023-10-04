import { Outlet } from "@remix-run/react"
import { LoaderFunctionArgs } from "@vercel/remix"

import { getCurrentAdmin } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await getCurrentAdmin(request)
}

export default function Layout() {
  return <Outlet />
}
