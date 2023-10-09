import { createCookieSessionStorage } from "@vercel/remix"
import { createTypedSessionStorage } from "remix-utils/typed-session"
import { z } from "zod"

import { IS_PRODUCTION, THEME_SESSION_SECRET } from "~/lib/config.server"
import { isTheme, type Theme } from "~/lib/theme"

export const THEME_COOKIE_KEY = IS_PRODUCTION ? "ramble_session_theme" : "ramble_session_dev_theme"

const storage = createCookieSessionStorage({
  cookie: {
    name: THEME_COOKIE_KEY,
    secrets: [THEME_SESSION_SECRET],
    sameSite: "lax",
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

const themeStorage = createTypedSessionStorage({
  sessionStorage: storage,
  schema: z.object({ theme: z.enum(["light", "dark"]).optional() }),
})

export async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"))
  const themeValue = session.data.theme
  const theme = isTheme(themeValue) ? themeValue : "light"
  return {
    theme,
    setTheme: (theme: Theme) => session.set("theme", theme),
    commit: () => themeStorage.commitSession(session),
  }
}
