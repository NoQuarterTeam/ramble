import { createCookie } from "@vercel/remix"
import { CSRF } from "remix-utils/csrf/server"

import { IS_PRODUCTION, SESSION_SECRET } from "~/lib/config.server"

export const CSRF_COOKIE_KEY = IS_PRODUCTION ? "ramble_session_csrf" : "ramble_session_dev_csrf"

export const cookie = createCookie(CSRF_COOKIE_KEY, {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  secrets: [SESSION_SECRET],
})

export const csrf = new CSRF({ cookie, secret: SESSION_SECRET })
