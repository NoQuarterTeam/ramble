"use server"

import { createToken } from "@/lib/jwt"
import { db } from "@/lib/server/db"
import { sendResetPasswordEmail } from "@ramble/server-services"
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
      const token = await createToken({ id: user.id })
      await sendResetPasswordEmail(user, token)
    }

    return { ok: true }
  } catch {
    return { ok: false, formError: "Error sending reset password email. Please try again." }
  }
}
