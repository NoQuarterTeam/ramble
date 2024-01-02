import { type Prisma } from "@ramble/database/types"

import { db } from "~/lib/db.server"
import type { Await } from "~/lib/helpers/types"
import { redirect } from "~/lib/vendor/vercel.server"

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
  isVerified: true,
  firstName: true,
  lastName: true,
  preferredLanguage: true,
  avatar: true,
  isAdmin: true,
  isPendingGuideApproval: true,
  isLocationPrivate: true,
  avatarBlurHash: true,
  username: true,
  role: true,
  latitude: true,
  longitude: true,
  createdAt: true,
} satisfies Prisma.UserSelect

export async function getCurrentUser<T extends Prisma.UserSelect>(request: Request, select?: T) {
  const userId = await requireUser(request)
  const user = await db.user.findFirst({
    where: { id: userId },
    select: select ?? userSelectFields,
  })
  if (!user) throw redirect(`/login`)
  return user as unknown as Prisma.UserGetPayload<{ select: T }>
}
export type CurrentUser = Await<typeof getCurrentUser>

export async function getMaybeUser<T extends Prisma.UserSelect>(request: Request, select?: T) {
  const { userId } = await getUserSession(request)
  if (!userId) return null
  const user = await db.user.findFirst({
    where: { id: userId },
    select: select ?? userSelectFields,
  })
  if (!user) return null
  return user as unknown as Prisma.UserGetPayload<{ select: T }>
}
export type MayubeUser = Await<typeof getMaybeUser>

export async function getCurrentAdmin(request: Request) {
  const userId = await requireUser(request)
  const user = await db.user.findUnique({ where: { id: userId, isAdmin: true } })
  if (!user) throw redirect(`/`)
  return user
}
