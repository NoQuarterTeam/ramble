import { merge } from "@ramble/shared"
import { Heading as RHeading } from "@react-email/components"
import * as React from "react"

interface Props {
  children: React.ReactNode
  className?: string
}

export function Heading(props: Props) {
  return (
    <RHeading
      style={{ fontFamily: "Urbanist, Verdana, sans-serif" }}
      as="h1"
      className={merge("text-primary text-2xl font-bold italic", props.className)}
    >
      {props.children}
    </RHeading>
  )
}
