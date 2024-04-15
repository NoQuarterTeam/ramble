import { appRouter, createContext } from "@ramble/api"
import { IS_PRODUCTION } from "@ramble/server-env"
import * as Sentry from "@sentry/node"
import * as trpcFetch from "@trpc/server/adapters/fetch"

Sentry.init({
  dsn: "https://d759f9c5e0ea4ee6ab6c1e31977c6dad@o204549.ingest.us.sentry.io/4507084401737728",
  tracesSampleRate: 1.0,
})

import type { ActionFunctionArgs, LoaderFunctionArgs } from "~/lib/vendor/vercel.server"

const ACCEPTABLE_ERROR_CODES = ["BAD_REQUEST", "UNAUTHORIZED", "NOT_FOUND"]

function handleRequest(args: LoaderFunctionArgs | ActionFunctionArgs) {
  return trpcFetch.fetchRequestHandler({
    endpoint: "/api/trpc",
    req: args.request,
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.log(error)

      if (IS_PRODUCTION && !ACCEPTABLE_ERROR_CODES.includes(error.code)) {
        Sentry.captureException(error)
        console.error(`${path} : ${error.message}`)
      }
    },
  })
}

export const loader = handleRequest
export const action = handleRequest
