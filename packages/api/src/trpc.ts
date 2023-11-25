import { initTRPC, TRPCError } from "@trpc/server"
import { type inferAsyncReturnType } from "@trpc/server"
import type * as trpcFetch from "@trpc/server/adapters/fetch"
import superjson from "superjson"
import { ZodError } from "zod"

import { prisma } from "@ramble/database"
import { type User } from "@ramble/database/types"
import { decodeAuthToken } from "@ramble/server-services"

export async function createContext({ req }: trpcFetch.FetchCreateContextFnOptions) {
  const headers = new Headers(req.headers)
  const authHeader = headers.get("authorization")
  const token = authHeader?.split("Bearer ")[1]
  let user: User | null = null
  if (token) {
    const payload = decodeAuthToken(token)
    user = await prisma.user.findUnique({ where: { id: payload.id } })
  }
  return { req, prisma, user }
}
export type Context = inferAsyncReturnType<typeof createContext>

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
