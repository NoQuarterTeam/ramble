import type * as React from "react"
import { Body, Head, Html, Preview } from "@react-email/components"

import { Tailwind } from "@react-email/components"

import { theme } from "../tailwind"

export function EmailDocument({ children, preview }: { children: React.ReactNode; preview?: string }) {
  return (
    <Tailwind config={{ theme }}>
      <Html className="bg-background" lang="en" dir="ltr">
        <Head />
        {preview && <Preview>{preview}</Preview>}
        <Body>{children}</Body>
      </Html>
    </Tailwind>
  )
}
