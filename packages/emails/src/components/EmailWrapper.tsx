import { Preview, Container, Tailwind } from "@react-email/components"
import type * as React from "react"
import { theme } from "../tailwind"

export function EmailWrapper({ children, preview }: { children: React.ReactNode; preview?: string }) {
  return (
    <Tailwind config={{ theme }}>
      <div className="bg-background">
        {preview && <Preview>{preview}</Preview>}
        <Container className="font-sans text-white">
          <div className="rounded-xs my-2 border border-gray-700 p-10">
            {children}
            <div className="mt-6">
              <p>Love,</p>
              <p>Ramble Team</p>
            </div>
          </div>
          <div className="p-10">
            <p className="text-center text-sm text-gray-500">No Quarter B.V</p>
            <p className="text-center text-sm text-gray-500">8A ms.Oslofjordweg 1033 SM, Amsterdam, The Netherlands</p>
          </div>
        </Container>
      </div>
    </Tailwind>
  )
}
