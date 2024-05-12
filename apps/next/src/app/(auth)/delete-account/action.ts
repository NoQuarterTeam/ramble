"use server"

import { db } from "@/lib/server/db"
import { comparePasswords, deleteObject, sendSlackMessage } from "@ramble/server-services"
import * as Sentry from "@sentry/nextjs"
import dayjs from "dayjs"
import { z } from "zod"

export const action = async (_: unknown, formData: FormData) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8, "Must be at least 8 characters"),
    })
    const result = schema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!result.success)
      return {
        ok: false,
        fieldErrors: result.error.flatten().fieldErrors,
      }

    const user = await db.user.findUnique({ where: { email: result.data.email } })
    if (!user) return { ok: false, formError: "Incorrect email or password" }
    const isCorrectPassword = comparePasswords(result.data.password, user.password)
    if (!isCorrectPassword) return { ok: false, formError: "Incorrect email or password" }

    const today = dayjs().format("YYYY-MM-DD")
    await db.user.update({
      where: { id: user.id },
      data: {
        deletedAt: new Date(),
        firstName: "Deleted",
        lastName: "User",
        email: `${today}-${user.email}`,
        bio: "",
        instagram: "",
        avatar: null,
        latitude: null,
        longitude: null,
      },
    })
    if (user.avatar) await deleteObject(user.avatar)
    sendSlackMessage(`😭 User @${user.username} deleted their account.`)
    return { ok: true }
  } catch (e) {
    Sentry.captureException(e)
    return { ok: false, formError: "Error resetting password. Please try again." }
  }
}
