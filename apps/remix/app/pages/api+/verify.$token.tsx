import { type LoaderArgs } from "@vercel/remix"

import { db } from "~/lib/db.server"
import { decryptToken } from "~/lib/jwt.server"
import { redirect } from "~/lib/remix.server"

export const loader = async ({ params }: LoaderArgs) => {
  const token = params.token
  if (!token) return redirect("/")
  const { id } = decryptToken<{ id: string }>(token)
  const user = await db.user.findUnique({ where: { id } })
  if (!user) return redirect("/")
  await db.user.update({ where: { id }, data: { isVerified: true } })
  return redirect("/map/verified")
}
