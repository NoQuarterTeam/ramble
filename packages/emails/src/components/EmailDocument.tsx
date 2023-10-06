import type * as React from "react"
import { Body, Font, Head, Html, Preview } from "@react-email/components"

export function EmailDocument({ children, preview }: { children: React.ReactNode; preview?: string }) {
  return (
    <Html lang="en" dir="ltr" style={{ backgroundColor: "white" }}>
      <Head>
        <Font
          fontFamily="Urbanist"
          fallbackFontFamily="Verdana"
          fontStyle="italic"
          fontWeight={700}
          webFont={{
            url: "https://fonts.gstatic.com/s/urbanist/v15/L0x4DF02iFML4hGCyMqgXS9sjlC0V7o.woff2",
            format: "woff2",
          }}
        />
        <Font
          fontFamily="Poppins"
          fallbackFontFamily="Verdana"
          fontStyle="normal"
          fontWeight={400}
          webFont={{
            url: "https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJnecnFHGPezSQ.woff2",
            format: "woff2",
          }}
        />
      </Head>
      {preview && <Preview>{preview}</Preview>}
      <Body style={{ fontFamily: "Poppins, Verdana", fontWeight: 400 }}>{children}</Body>
    </Html>
  )
}
