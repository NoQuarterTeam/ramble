import { Outlet } from "@remix-run/react"
import { cacheHeader } from "pretty-cache-header"

import { db } from "~/lib/db.server"
import type { LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { redirect } from "~/lib/vendor/vercel.server"
import { getUserSession } from "~/services/session/session.server"

export const headers = () => {
  return {
    "Cache-Control": cacheHeader({ maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min", public: true }),
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
        <div className="vstack bg-background w-full max-w-md space-y-8 p-4">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
