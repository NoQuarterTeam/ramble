"use server"

import { db } from "@/lib/server/db"
import { decodeToken, hashPassword } from "@ramble/server-services"
import * as Sentry from "@sentry/nextjs"
import { z } from "zod"

export const action = async (_: unknown, formData: FormData) => {
  try {
    const resetPasswordSchema = z.object({
      token: z.string(),
      password: z.string().min(8, "Must be at least 8 characters"),
    })
    const result = resetPasswordSchema.safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
    })

    if (!result.success)
      return {
        ok: false,
        fieldErrors: result.error.flatten().fieldErrors,
      }

    const payload = decodeToken<{ id: string }>(result.data.token)
    if (!payload) return { ok: false, formError: "Invalid token" }
    const hashedPassword = hashPassword(result.data.password)
    await db.user.update({ where: { id: payload.id }, data: { password: hashedPassword } })
    return { ok: true }
  } catch (e) {
    Sentry.captureException(e)
    return { ok: false, formError: "Error resetting password. Please try again." }
  }
}
