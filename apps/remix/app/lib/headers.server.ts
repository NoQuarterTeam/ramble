import type { HeadersFunction } from "~/lib/vendor/vercel.server"

import { IS_DEV } from "./config.server"

export const useLoaderHeaders: HeadersFunction = ({ loaderHeaders }) => {
  const headers = new Headers()
  const usefulHeaders = ["Cache-Control", "Vary", "Server-Timing"]
  if (IS_DEV) return headers
  for (const headerName of usefulHeaders) {
    if (loaderHeaders.has(headerName)) {
      headers.set(headerName, loaderHeaders.get(headerName) as string)
    }
  }
  return headers
}
