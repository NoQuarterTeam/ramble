import { prisma } from "@ramble/database"
import type { Prisma } from "@ramble/database/types"
import { decodeAuthToken } from "@ramble/server-services"
import { userInterestFields } from "@ramble/shared"
import * as Sentry from "@sentry/nextjs"
import { TRPCError, initTRPC } from "@trpc/server"
import type * as trpcFetch from "@trpc/server/adapters/fetch"
import superjson from "superjson"
import { ZodError } from "zod"

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
  instagram: true,
  bio: true,
  latitude: true,
  longitude: true,
  role: true,
  createdAt: true,
  tripSyncEnabled: true,
  tripSyncOnNetworkEnabled: true,
  ...userInterestFields,
} satisfies Prisma.UserSelect

export async function createContext({ req }: trpcFetch.FetchCreateContextFnOptions) {
  const headers = new Headers(req.headers)
  const authHeader = headers.get("authorization")
  const token = authHeader?.split("Bearer ")[1]
  let user: Prisma.UserGetPayload<{ select: typeof userSelectFields }> | null = null
  if (token) {
    const payload = decodeAuthToken(token)
    if (payload) {
      user = await prisma.user.findUnique({ where: { id: payload.id }, select: userSelectFields })
    }
  }
  if (user) Sentry.setUser({ id: user.id, email: user.email, username: user.username })
  return { req, prisma, user }
}
export type Context = Awaited<ReturnType<typeof createContext>>

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        formError: !(error.cause instanceof ZodError)
          ? error.code === "INTERNAL_SERVER_ERROR"
            ? "There was an error processing your request."
            : error.message
          : undefined,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" })
  return next({ ctx: { user: ctx.user } })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
