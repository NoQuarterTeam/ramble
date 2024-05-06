"use server"
import { Prisma } from "@ramble/database/types"
import { createAuthToken, decodeAuthToken } from "@ramble/server-services"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "./db"

const AUTH_COOKIE = "ramble.auth"

export async function getUserSession() {
  const encyptedUserId = cookies().get(AUTH_COOKIE)?.value
  if (!encyptedUserId) return null

  const res = decodeAuthToken(encyptedUserId)
  if (!res) return null
  return res.id
}

const oneMonth = 30 * 24 * 60 * 60 * 1000

export async function setUserSession(id: string) {
  const encyptedUserId = createAuthToken({ id })
  return cookies().set(AUTH_COOKIE, encyptedUserId, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: oneMonth,
  })
}

const userSelectFields = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatar: true,
  isAdmin: true,
  role: true,
  createdAt: true,
})

export async function getMaybeUser<T extends Prisma.UserSelect>(select?: T) {
  const userId = await getUserSession()
  if (!userId) return null
  const user = await db.user.findUnique({
    where: { id: userId },
    select: select ?? userSelectFields,
  })
  return user as unknown as Prisma.UserGetPayload<{ select: T }>
}

export async function requireUser() {
  const userId = await getUserSession()
  if (!userId) return redirect("/")
}

export async function getCurrentUser<T extends Prisma.UserSelect>(select?: T) {
  const user = await getMaybeUser(select)
  if (!user) redirect("/")
  return user as Prisma.UserGetPayload<{ select: T }>
}

export async function requireAdmin() {
  const user = await getMaybeUser()
  if (!user) redirect("/admin/login")
  if (!user.isAdmin) redirect("/")
  return user
}
export async function clearSession() {
  cookies().delete(AUTH_COOKIE)
}

export async function logout() {
  cookies().delete(AUTH_COOKIE)
  redirect("/")
}
