import { Outlet } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { redirect } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

import { db } from "~/lib/db.server"
import { json } from "~/lib/remix.server"
import { getUserSession } from "~/services/session/session.server"

export const handle = {
  disableScripts: false,
}

export const headers = () => {
  return {
    "Cache-Control": cacheHeader({ maxAge: "1hour", sMaxage: "1hour", public: true }),
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  const { userId } = await getUserSession(request)
  if (!userId) return json(null)
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (user) return redirect("/")
  return json(null)
}

export default function AuthLayout() {
  return (
    <div className="vstack">
      <div className="w-full max-w-md p-4 pt-10">
        <Outlet />
      </div>
    </div>
  )
}
