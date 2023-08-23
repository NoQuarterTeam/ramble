import * as trpcFetch from "@trpc/server/adapters/fetch"
import type { ActionArgs, LoaderArgs } from "@vercel/remix"

import { appRouter, createContext } from "@ramble/api"
import { IS_DEV } from "~/lib/config.server"

function handleRequest(args: LoaderArgs | ActionArgs) {
  return trpcFetch.fetchRequestHandler({
    endpoint: "/api/trpc",
    req: args.request,
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      if (!IS_DEV) {
        console.error("--- ERROR ---")
        console.error("Path: " + path)
        console.error("Message: " + error.message)
        // TODO: send to sentry
      }
    },
  })
}

export const loader = handleRequest
export const action = handleRequest
