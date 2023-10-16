import { useRouteLoaderData } from "@remix-run/react"
import { type SerializeFrom } from "~/lib/vendor/vercel.server"

import { type loader } from "~/root"

export function useMaybeUser() {
  return (useRouteLoaderData("root") as SerializeFrom<typeof loader>).user
}
