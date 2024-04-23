import type * as React from "react"

import { merge } from "@ramble/shared"

export function PageContainer(props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  return (
    <div {...props} className={merge("mx-auto max-w-6xl space-y-4 p-4 py-8", props.className)}>
      {props.children}
    </div>
  )
}
