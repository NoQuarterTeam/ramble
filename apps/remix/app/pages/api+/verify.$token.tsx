import { decodeToken, updateLoopsContact } from "@ramble/server-services"
import type { LoaderFunctionArgs } from "@remix-run/node"

import { db } from "~/lib/db.server"
import { redirect } from "~/lib/remix.server"

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const token = params.token
  if (!token) return redirect("/")
  const res = decodeToken<{ id: string }>(token)
  if (!res) return redirect("/")
  const id = res.id
  const user = await db.user.findUnique({ where: { id } })
  if (!user) return redirect("/")
  await db.user.update({ where: { id }, data: { isVerified: true } })
  void updateLoopsContact({ email: user.email, isVerified: true })
  return redirect("/account/verified")
}
