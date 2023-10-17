import { createCookie } from "~/lib/vendor/vercel.server"
import { CSRF } from "remix-utils/csrf/server"

import { IS_PRODUCTION } from "~/lib/config.server"
import { SESSION_SECRET } from "~/lib/env.server"

const CSRF_COOKIE_KEY = IS_PRODUCTION ? "ramble_session_csrf" : "ramble_session_dev_csrf"

export const cookie = createCookie(CSRF_COOKIE_KEY, {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  secrets: [SESSION_SECRET],
})

export const csrf = new CSRF({ cookie, secret: SESSION_SECRET })
