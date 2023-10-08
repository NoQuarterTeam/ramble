import { track } from "@vercel/analytics/server"
import type { ActionFunctionArgs } from "@vercel/remix"

import { redirect } from "~/lib/remix.server"
import { getUserSession } from "~/services/session/session.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const { destroy, userId } = await getUserSession(request)
  const headers = new Headers([["set-cookie", await destroy()]])
  track("Logged out", { userId: userId })
  return redirect("/map", request, { headers, flash: { title: "Logged out!", description: "See you soon!" } })
}

export const loader = () => redirect("/login")
