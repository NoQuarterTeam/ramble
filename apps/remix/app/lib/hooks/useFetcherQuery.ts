import * as React from "react"
import { useFetcher } from "@remix-run/react"

export function useFetcherQuery<T>(url: string) {
  const fetcher = useFetcher<T>()

  React.useEffect(() => {
    fetcher.load(url)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return fetcher
}
