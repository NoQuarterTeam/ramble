import { createCookieSessionStorage } from "@vercel/remix"
import { createTypedSessionStorage } from "remix-utils"
import { z } from "zod"

import { IS_PRODUCTION, SESSION_SECRET } from "~/lib/config.server"

export const COOKIE_KEY = IS_PRODUCTION ? "ramble" : "ramble_session_dev"

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
  const userId: string | null = session.get("userId") || null
  const setUser = (id: string) => {
    session.set("userId", id)
    return commit()
  }
  return { commit, destroy, session, setUser, userId }
}
