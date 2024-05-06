import { db } from "@/lib/server/db"
import { decodeToken, updateLoopsContact } from "@ramble/server-services"
import { redirect } from "next/navigation"

export const GET = async (_request: Request, { params }: { params: { token: string } }) => {
  const token = params.token
  if (!token) return redirect("/")
  const payload = decodeToken<{ id: string }>(token)
  if (!payload) return redirect("/")
  const user = await db.user.findUnique({ where: { id: payload.id } })
  if (!user) return redirect("/")
  await db.user.update({ where: { id: payload.id }, data: { isVerified: true } })
  void updateLoopsContact({ email: user.email, isVerified: true })
  return redirect("/verified")
}
