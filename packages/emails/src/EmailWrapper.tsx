import type * as React from "react"
import { Container } from "@react-email/container"
import { Font } from "@react-email/font"
import { Head } from "@react-email/head"
import { Html } from "@react-email/html"
import { Tailwind } from "@react-email/tailwind"
import { type Config } from "tailwindcss"

import colors from "@travel/tailwind-config/src/colors"

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
    },
  },
} satisfies Config["theme"]

export function EmailWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
        />
      </Head>
      <Tailwind config={{ theme }}>
        <Container className="font-sans">{children}</Container>
      </Tailwind>
    </Html>
  )
}
