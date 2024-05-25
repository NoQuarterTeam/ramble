import { appRouter, createContext } from "@ramble/api"
import * as Sentry from "@sentry/nextjs"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

/**
 * Configure basic CORS headers
 * You should extend this to match your needs
 */
const setCorsHeaders = (res: Response) => {
  res.headers.set("Access-Control-Allow-Origin", "*")
  res.headers.set("Access-Control-Request-Method", "*")
  res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST")
  res.headers.set("Access-Control-Allow-Headers", "*")
}

export const OPTIONS = () => {
  const response = new Response(null, { status: 204 })
  setCorsHeaders(response)
  return response
}
const acceptedErrors = ["BAD_REQUEST", "UNAUTHORIZED", "NOT_FOUND"]

const handler = async (req: Request) => {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext,
    onError({ error, path }) {
      if (acceptedErrors.includes(error.code)) return
      Sentry.captureException(error)
      console.error(`>>> tRPC Error on '${path}'`, error)
    },
  })

  setCorsHeaders(response)
  return response
}

export const dynamic = "force-dynamic"
export const maxDuration = 60

export { handler as GET, handler as POST }
