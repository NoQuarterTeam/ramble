"use server"

import { requireAdmin } from "@/lib/server/auth"
import { db } from "@/lib/server/db"
import { sendSpotVerifiedNotification } from "@ramble/server-services"
import * as Sentry from "@sentry/nextjs"
import { revalidatePath } from "next/cache"

export async function deleteSpot(id: string) {
  await requireAdmin()
  try {
    await db.spot.update({ where: { id }, data: { deletedAt: new Date() } })
    revalidatePath("/admin/spots", "page")
    return true
  } catch (e) {
    Sentry.captureException(e)
    return false
  }
}

export async function verifySpot(id: string) {
  const admin = await requireAdmin()
  try {
    await db.spot.update({ where: { id }, data: { verifiedAt: new Date(), verifierId: admin.id } })
    await sendSpotVerifiedNotification({ initiatorId: admin.id, spotId: id })
    revalidatePath("/admin/spots", "page")
    return true
  } catch (e) {
    Sentry.captureException(e)
    return false
  }
}

export async function updateSpotCover(id: string, coverId: string) {
  await requireAdmin()
  try {
    await db.spot.update({ where: { id }, data: { coverId } })
    revalidatePath("/admin/spots", "page")
    return true
  } catch (e) {
    Sentry.captureException(e)
    return false
  }
}
