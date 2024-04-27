"use server"

import { requireAdmin } from "@/lib/server/auth"
import { db } from "@/lib/server/db"
import { revalidatePath } from "next/cache"

export async function deleteSpot(id: string) {
  await requireAdmin()
  await db.spot.update({ where: { id }, data: { deletedAt: new Date() } })
  revalidatePath("/admin/spots", "page")
  return true
}

export async function verifySpot(id: string) {
  const admin = await requireAdmin()
  await db.spot.update({ where: { id }, data: { verifiedAt: new Date(), verifierId: admin.id } })
  revalidatePath("/admin/spots", "page")
  return true
}
