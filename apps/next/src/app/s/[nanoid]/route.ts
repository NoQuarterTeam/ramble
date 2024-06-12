import { prisma } from "@ramble/database"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

export async function GET(_: NextRequest, { params }: { params: { nanoid: string } }) {
  const spot = await prisma.spot.findUnique({ where: { nanoid: params.nanoid }, select: { id: true } })
  if (!spot) redirect("/")
  redirect(`/map/${spot.id}`)
}
