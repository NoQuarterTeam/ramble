import { useRouteLoaderData } from "@remix-run/react"
import { type AppLayoutLoader } from "~/pages/_main+/_app+/_layout"

export function useMapLayers() {
  return (useRouteLoaderData("pages/_main+/_app+/_layout") as AppLayoutLoader).mapLayers
}
