import { Outlet } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { redirect } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

import { db } from "~/lib/db.server"
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
  if (!userId) return null
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (user) return redirect("/")
  return null
}

export default function AuthLayout() {
  return (
    <div className="center flex-col pt-10">
      <div className="vstack w-full">
        <div className="vstack w-full max-w-md space-y-8 bg-white p-4 dark:bg-gray-800">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
