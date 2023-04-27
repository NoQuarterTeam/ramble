import { SerializeFrom } from "@remix-run/node"
import { useRouteLoaderData } from "@remix-run/react"
import { loader } from "~/root"

export function useMaybeUser() {
  return (useRouteLoaderData("root") as SerializeFrom<typeof loader>).user
}
