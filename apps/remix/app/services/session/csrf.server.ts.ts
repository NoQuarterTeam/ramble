import { createCookieSessionStorage } from "@vercel/remix"
import { createAuthenticityToken, verifyAuthenticityToken } from "remix-utils"

import { IS_PRODUCTION, SESSION_SECRET } from "~/lib/config.server"

export const CSRF_COOKIE_KEY = IS_PRODUCTION ? "ramble_session_csrf" : "ramble_session_dev_csrf"

const storage = createCookieSessionStorage({
  cookie: {
    name: CSRF_COOKIE_KEY,
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

export async function getCsrfSession(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"))

  const token = createAuthenticityToken(session)
  return {
    token,
    session,
    commit: () => storage.commitSession(session),
    verify: () => verifyAuthenticityToken(request, session),
  }
}
export async function verifyCsrf(request: Request) {
  const session = await getCsrfSession(request)
  return session.verify()
}
