import { redirect } from "~/lib/remix.server"

import type { ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { getUserSession } from "~/services/session/session.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const { destroy } = await getUserSession(request)
  const headers = new Headers([["set-cookie", await destroy()]])
  return redirect("/", request, { headers, flash: { title: "Logged out!", description: "See you soon!" } })
}

export const loader = () => redirect("/login")
