import type * as React from "react"
import { Container, Preview, Tailwind } from "@react-email/components"
import { type Config } from "tailwindcss"

import colors from "@ramble/tailwind-config/src/colors"

const theme = {
  extend: {
    spacing: {
      full: "100%",
    },
    borderRadius: {
      xs: "2px",
    },
    fontSize: {
      xxxs: "0.4rem",
      xxs: "0.625rem",
    },
    fontFamily: {
      sans: ["Roboto", "sans-serif"],
      serif: ["Roboto", "sans-serif"],
    },
    colors: {
      primary: colors.primary,
      gray: colors.gray,
      background: "#241c17",
    },
  },
} satisfies Config["theme"]

export function EmailWrapper({ children, preview }: { children: React.ReactNode; preview?: string }) {
  return (
    <Tailwind config={{ theme }}>
      {preview && <Preview>{preview}</Preview>}
      <div className="bg-background">
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
