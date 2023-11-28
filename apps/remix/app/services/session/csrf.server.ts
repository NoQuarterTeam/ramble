import { CSRF } from "remix-utils/csrf/server"

import { env, IS_PRODUCTION } from "@ramble/server-env"

import { createCookie } from "~/lib/vendor/vercel.server"

const CSRF_COOKIE_KEY = IS_PRODUCTION ? "ramble_session_csrf" : "ramble_session_dev_csrf"

export const cookie = createCookie(CSRF_COOKIE_KEY, {
  path: "/",
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  secrets: [env.SESSION_SECRET],
})

export const csrf = new CSRF({ cookie, secret: env.SESSION_SECRET })
