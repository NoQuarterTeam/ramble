import { decodeToken, updateLoopsContact } from "@ramble/server-services"

import { db } from "@/lib/server/db"
import { redirect } from "next/navigation"

export const GET = async (_request: Request, { params }: { params: { token: string } }) => {
  const token = params.token
  if (!token) return redirect("/")
  const { id } = decodeToken<{ id: string }>(token)
  const user = await db.user.findUnique({ where: { id } })
  if (!user) return redirect("/")
  await db.user.update({ where: { id }, data: { isVerified: true } })
  void updateLoopsContact({ email: user.email, isVerified: true })
  return redirect("/verified")
}
