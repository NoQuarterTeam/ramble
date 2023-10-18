import { Outlet } from "@remix-run/react"
import { redirect } from "~/lib/remix.server"
import { LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { getUserSession } from "~/services/session/session.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { userId } = await getUserSession(request)
  const url = new URL(request.url)

  if (!userId && url.pathname !== "/") return redirect("/")
  return null
}

export default Outlet
