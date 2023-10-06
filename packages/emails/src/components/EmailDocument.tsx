import type * as React from "react"
import { Body, Font, Head, Html, Preview } from "@react-email/components"

import { Tailwind } from "@react-email/components"

import { theme } from "../tailwind"

export function EmailDocument({ children, preview }: { children: React.ReactNode; preview?: string }) {
  return (
    <Tailwind config={{ theme }}>
      <Html className="bg-background" lang="en" dir="ltr">
        <Head>
          <Font
            fontFamily="Urbanist"
            fallbackFontFamily="Verdana"
            fontStyle="normal"
            fontWeight={500}
            webFont={{
              url: "https://fonts.gstatic.com/s/urbanist/v15/L0xjDF02iFML4hGCyOCpRdycFsGxSrqD-R4vH5msacG1Koy1cIU.woff",
              format: "woff",
            }}
          />
          {/* <Font
            fontFamily="Poppins"
            fallbackFontFamily="Verdana"
            fontStyle="normal"
            fontWeight={400}
            webFont={{
              url: "https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJnecnFHGPezSQ.woff2",
              format: "woff2",
            }}
          /> */}
        </Head>
        {preview && <Preview>{preview}</Preview>}
        <Body>{children}</Body>
      </Html>
    </Tailwind>
  )
}
