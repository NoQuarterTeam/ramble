import { Nav } from "@/components/Nav"
import { PosthogProvider } from "@/components/PosthogProvider"
import { TRPCReactProvider } from "@/lib/trpc/react"
import "mapbox-gl/dist/mapbox-gl.css"
import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { Urbanist } from "next/font/google"
import "./globals.css"

const PostHogPageView = dynamic(() => import("../components/PosthogPageView"), {
  ssr: false,
})

const font = Urbanist({ subsets: ["latin"], variable: "--font-urbanist" })

export const metadata: Metadata = {
  title: "Ramble",
  description: "Van life app",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <PosthogProvider>
        <TRPCReactProvider>
          <body className={font.className}>
            <Nav />
            <PostHogPageView />
            <div className="pt-nav">{children}</div>
          </body>
        </TRPCReactProvider>
      </PosthogProvider>
    </html>
  )
}
