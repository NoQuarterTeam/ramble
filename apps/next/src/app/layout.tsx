import type { Metadata } from "next"
import { Urbanist } from "next/font/google"

import { Nav } from "@/components/Nav"
import { TRPCReactProvider } from "@/lib/trpc/react"
import "./globals.css"

const font = Urbanist({ subsets: ["latin"], variable: "--font-urbanist" })

export const metadata: Metadata = {
  title: "Ramble",
  description: "Van life app",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Nav />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  )
}
