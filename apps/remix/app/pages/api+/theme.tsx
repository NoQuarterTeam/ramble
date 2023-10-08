import { track } from "~/lib/analytics.server"
import { type ActionFunctionArgs, json, redirect } from "@vercel/remix"

import { isTheme } from "~/lib/theme"
import { getUserSession } from "~/services/session/session.server"
import { getThemeSession } from "~/services/session/theme.server"

export const config = {
  // runtime: "edge",
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const themeSession = await getThemeSession(request)
  const { userId } = await getUserSession(request)
  const requestText = await request.text()
  const form = new URLSearchParams(requestText)
  const theme = form.get("theme")

  if (!isTheme(theme)) {
    return json({ success: false, message: `theme value of ${theme} is not a valid theme` })
  }
  themeSession.setTheme(theme)
  track("Theme switched", { theme, userId })
  return json({ theme }, { headers: { "set-cookie": await themeSession.commit() } })
}

export const loader = async () => redirect("/", { status: 404 })
