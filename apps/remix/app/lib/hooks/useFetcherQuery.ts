import * as React from "react"
import { useFetcher } from "@remix-run/react"

export function useFetcherQuery<T>(url: string, opts?: { isEnabled?: boolean }) {
  const fetcher = useFetcher<T>()

  React.useEffect(() => {
    if (opts && !opts.isEnabled) return
    fetcher.load(url)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, opts?.isEnabled])

  return fetcher
}
