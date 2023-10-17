import { createTypedSessionStorage } from "remix-utils/typed-session"

import { IS_PRODUCTION } from "~/lib/config.server"
import { SESSION_SECRET } from "~/lib/env.server"
import { createCookieSessionStorage } from "~/lib/vendor/vercel.server"
import { z } from "~/lib/vendor/zod.server"

const COOKIE_KEY = IS_PRODUCTION ? "ramble" : "ramble_session_dev"

const storage = createCookieSessionStorage({
  cookie: {
    name: COOKIE_KEY,
    secrets: [SESSION_SECRET],
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

const userStorage = createTypedSessionStorage({ sessionStorage: storage, schema: z.object({ userId: z.string().optional() }) })

export async function getUserSession(request: Request) {
  const session = await userStorage.getSession(request.headers.get("Cookie"))
  const commit = () => userStorage.commitSession(session)
  const destroy = () => userStorage.destroySession(session)
  const setUser = (id: string) => {
    session.set("userId", id)
    return commit()
  }
  const userId = session.get("userId") || null
  return { commit, destroy, session, setUser, userId }
}
