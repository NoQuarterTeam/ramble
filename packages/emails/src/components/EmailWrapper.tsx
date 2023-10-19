import type * as React from "react"
import { Container, Tailwind } from "@react-email/components"

import { theme } from "../tailwind"

export function EmailWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Tailwind config={{ theme }}>
      <Container>
        <Container className="rounded-xs border-gray-[rgba(120,120,120,0.9)] my-2 border border-solid">
          <div className="p-10">
            {children}
            <div className="mt-6">
              <p>Love,</p>
              <p>Ramble Team</p>
            </div>
          </div>
        </Container>
        <Container>
          <div className="p-10">
            <p className="text-center text-sm text-gray-500">No Quarter B.V</p>
            <p className="text-center text-sm text-gray-500">8A ms.Oslofjordweg 1033 SM, Amsterdam, The Netherlands</p>
          </div>
        </Container>
      </Container>
    </Tailwind>
  )
}
