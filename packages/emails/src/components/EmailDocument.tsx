import type * as React from "react"
import { Body, Head, Html } from "@react-email/components"

import { Tailwind } from "@react-email/components"

import { theme } from "../tailwind"

export function EmailDocument({ children }: { children: React.ReactNode }) {
  return (
    <Tailwind config={{ theme }}>
      <Html className="bg-background" lang="en" dir="ltr">
        <Head />
        <Body>{children}</Body>
      </Html>
    </Tailwind>
  )
}
