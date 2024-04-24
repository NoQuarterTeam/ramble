import type * as React from "react"

import { merge } from "@ramble/shared"

export function Limiter({ className, ...props }: React.HtmlHTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={merge("w-full px-4 lg:px-24 md:px-10 xl:px-40", className)} />
}
