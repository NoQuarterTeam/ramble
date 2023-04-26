import { redirect } from "@vercel/remix"

import { type Prisma } from "@travel/database/types"

import { db } from "~/lib/db.server"
import type { Await } from "~/lib/helpers/types"

import { getUserSession } from "../session/session.server"

export async function requireUser(request: Request) {
  const { userId } = await getUserSession(request)
  const url = new URL(request.url)
  if (!userId) throw redirect(`/login${request.method === "GET" ? `?redirectTo=${url.pathname}` : ""}`)
  return userId
}

const userSelectFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatar: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect

export async function getCurrentUser(request: Request) {
  const userId = await requireUser(request)
  const user = await db.user.findFirst({
    where: { id: userId },
    select: userSelectFields,
  })
  if (!user) throw redirect(`/login`)
  return user
}
export type CurrentUser = Await<typeof getCurrentUser>

export async function getMaybeUser(request: Request) {
  const { userId } = await getUserSession(request)
  if (!userId) return null
  const user = await db.user.findFirst({ where: { id: userId }, select: userSelectFields })
  if (!user) return null
  return user
}
export type MayubeUser = Await<typeof getMaybeUser>
