import { useRouteLoaderData } from "@remix-run/react"
import type { RootLoader } from "~/root"

export function usePreferences() {
  return (useRouteLoaderData("root") as RootLoader).preferences
}
