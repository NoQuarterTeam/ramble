import { Container, Tailwind } from "@react-email/components"
import type * as React from "react"

import { theme } from "../tailwind"

export function EmailWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Tailwind config={{ theme }}>
      <Container>
        <Container className="my-2 rounded-xs border border-gray-[rgba(120,120,120,0.9)] border-solid">
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
            <p className="text-center text-gray-500 text-sm">No Quarter</p>
            <p className="text-center text-gray-500 text-sm">Huidekoperstraat 30 H, 1017 ZM, Amsterdam, The Netherlands</p>
          </div>
        </Container>
      </Container>
    </Tailwind>
  )
}
