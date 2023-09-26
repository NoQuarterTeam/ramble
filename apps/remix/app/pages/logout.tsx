import type { ActionArgs } from "@vercel/remix"

import { redirect } from "~/lib/remix.server"
import { getUserSession } from "~/services/session/session.server"

export const action = async ({ request }: ActionArgs) => {
  const { destroy } = await getUserSession(request)
  const headers = new Headers([["Set-Cookie", await destroy()]])
  return redirect("/map", request, { headers, flash: { title: "Logged out!", description: "See you soon!" } })
}

export const loader = () => redirect("/login")
