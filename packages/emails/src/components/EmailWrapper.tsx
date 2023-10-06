import { Container, Tailwind } from "@react-email/components"
import type * as React from "react"
import { theme } from "../tailwind"

export function EmailWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Tailwind config={{ theme }}>
      <Container className="bg-background font-sans text-white">
        <Container className="rounded-xs my-2 border border-solid border-gray-700">
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
