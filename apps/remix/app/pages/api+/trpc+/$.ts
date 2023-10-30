import * as trpcFetch from "@trpc/server/adapters/fetch"

import { appRouter, createContext } from "@ramble/api"

import { IS_PRODUCTION } from "~/lib/config.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "~/lib/vendor/vercel.server"

function handleRequest(args: LoaderFunctionArgs | ActionFunctionArgs) {
  return trpcFetch.fetchRequestHandler({
    endpoint: "/api/trpc",
    req: args.request,
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      if (IS_PRODUCTION) {
        console.error(path + " : " + error.message)
        // TODO: send to sentry or something
      }
    },
  })
}

export const loader = handleRequest
export const action = handleRequest
