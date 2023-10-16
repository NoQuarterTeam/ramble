import { type LoaderFunctionArgs } from "~/lib/vendor/vercel.server"

import { db } from "~/lib/db.server"
import { decryptToken } from "~/lib/jwt.server"
import { redirect } from "~/lib/remix.server"

export const config = {
  // runtime: "edge",
  // regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const token = params.token
  if (!token) return redirect("/")
  const { id } = await decryptToken<{ id: string }>(token)
  const user = await db.user.findUnique({ where: { id } })
  if (!user) return redirect("/")
  await db.user.update({ where: { id }, data: { isVerified: true } })
  return redirect("/map/verified")
}
