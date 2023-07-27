import * as trpcFetch from "@trpc/server/adapters/fetch"
import type { ActionArgs, LoaderArgs } from "@vercel/remix"

import { appRouter, createContext } from "@ramble/api"

export const config = {
  runtime: "edge",
}

function handleRequest(args: LoaderArgs | ActionArgs) {
  return trpcFetch.fetchRequestHandler({
    endpoint: "/api/trpc",
    req: args.request,
    router: appRouter,
    createContext,
  })
}

export const loader = handleRequest
export const action = handleRequest
