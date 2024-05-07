"use server"

import { db } from "@/lib/server/db"
import { createToken, sendResetPasswordEmail } from "@ramble/server-services"
import * as Sentry from "@sentry/nextjs"
import { z } from "zod"

export const action = async (_: unknown, formData: FormData) => {
  try {
    const resetSchema = z.object({ email: z.string().email("Invalid email") })
    const result = resetSchema.safeParse({
      email: formData.get("email"),
    })
    if (!result.success)
      return {
        ok: false,
        fieldErrors: result.error.flatten().fieldErrors,
      }

    const user = await db.user.findUnique({ where: { email: result.data.email } })
    if (user) {
      const token = createToken({ id: user.id })
      await sendResetPasswordEmail(user, token)
    }

    return { ok: true }
  } catch (e) {
    Sentry.captureException(e)
    return { ok: false, formError: "Error sending reset password email. Please try again." }
  }
}
