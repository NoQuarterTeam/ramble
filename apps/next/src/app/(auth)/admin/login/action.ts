"use server"

import { clearSession, setUserSession } from "@/lib/server/auth"
import { db } from "@/lib/server/db"
import { userSchema } from "@ramble/server-schemas"
import { comparePasswords } from "@ramble/server-services"
import * as Sentry from "@sentry/nextjs"
import { redirect } from "next/navigation"

export const action = async (_: unknown, formData: FormData) => {
  try {
    const result = userSchema
      .pick({ email: true, password: true })
      .safeParse({ email: formData.get("email"), password: formData.get("password") })
    if (!result.success) return { ok: false, fieldErrors: result.error.flatten().fieldErrors }
    const user = await db.user.findUnique({ where: { email: result.data.email } })
    if (!user) return { ok: false, formError: "Incorrect email or password" }
    const isCorrectPassword = comparePasswords(result.data.password, user.password)
    if (!user.isAdmin) return { ok: false, formError: "Log in not currently available, please use the app for now." }
    if (!isCorrectPassword) return { ok: false, formError: "Incorrect email or password" }
    clearSession()
    setUserSession(user.id)
    Sentry.setUser({ id: user.id, email: user.email, username: user.username })
  } catch (e) {
    Sentry.captureException(e)
    return { ok: false, formError: "Error logging in. Please try again." }
  }
  redirect("/admin")
  // needed for types..
  return { ok: true }
}
