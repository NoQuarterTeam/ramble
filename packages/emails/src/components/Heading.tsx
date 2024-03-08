import { Heading as RHeading } from "@react-email/components"
import type * as React from "react"

import { merge } from "@ramble/shared"

interface Props {
  children: React.ReactNode
  className?: string
}

export function Heading(props: Props) {
  return (
    <RHeading as="h1" className={merge("font-bold text-2xl text-primary italic", props.className)}>
      {props.children}
    </RHeading>
  )
}
