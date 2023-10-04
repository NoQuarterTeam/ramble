import type * as React from "react"
import { Body, Head, Html } from "@react-email/components"

export function EmailDocument({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Head />
      <Body>{children}</Body>
    </Html>
  )
}
