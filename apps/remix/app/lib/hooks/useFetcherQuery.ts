import { useFetcher } from "@remix-run/react"
import * as React from "react"

export function useFetcherQuery<T>(
  url: string,
  opts?: { isEnabled?: boolean },
  fetcherOptions?: Parameters<typeof useFetcher>[0],
) {
  const fetcher = useFetcher<T>(fetcherOptions)

  React.useEffect(() => {
    if (opts && !opts.isEnabled) return
    fetcher.load(url)
  }, [url, opts, fetcher.load])

  return fetcher
}
