"use server"

import { requireAdmin } from "@/lib/server/auth"
import { db } from "@/lib/server/db"
import { sendBetaInvitationEmail, updateLoopsContact } from "@ramble/server-services"
import * as Sentry from "@sentry/nextjs"
import { revalidatePath } from "next/cache"

export async function deleteRequest(id: string) {
  await requireAdmin()
  try {
    await db.accessRequest.delete({ where: { id } })
    revalidatePath("/admin/access-request", "page")
    return true
  } catch (e) {
    Sentry.captureException(e)
    return false
  }
}

export async function acceptRequest(id: string) {
  await requireAdmin()
  try {
    const request = await db.accessRequest.update({ where: { id }, data: { acceptedAt: new Date() } })
    sendBetaInvitationEmail(request.email, request.code)
    updateLoopsContact({
      email: request.email,
      accessRequestAcceptedAt: new Date().toISOString(),
      inviteCode: request.code,
    })
    revalidatePath("/admin/access-request", "page")
    return true
  } catch (e) {
    Sentry.captureException(e)
    return false
  }
}
