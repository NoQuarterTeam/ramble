import { Nav } from "@/components/Nav"
import { PosthogProvider } from "@/components/PosthogProvider"
import { TRPCReactProvider } from "@/lib/trpc/react"

import { TooltipProvider } from "@/components/TooltipProvider"
import "mapbox-gl/dist/mapbox-gl.css"
import type { Metadata, Viewport } from "next"
import dynamic from "next/dynamic"
import { Urbanist } from "next/font/google"
import "./globals.css"

const PostHogPageView = dynamic(() => import("../components/PosthogPageView"), {
  ssr: false,
})

const font = Urbanist({ subsets: ["latin"], variable: "--font-urbanist" })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: "dark",
  themeColor: "#241c17",
}

export const metadata: Metadata = {
  title: "Ramble: Van Travel App",
  description: "For a new generation of digitally connected, adventurous and eco-conscious travelers.",
  openGraph: {
    type: "website",
    title: "Ramble: Van Travel App",
    description: "For a new generation of digitally connected, adventurous and eco-conscious travelers.",
    url: "https://ramble.guide",
    images: ["https://ramble.guide/landing/hero.avif"],
  },
  appLinks: {
    ios: {
      url: "ramble://",
      app_store_id: "id6468265289",
      app_name: "Ramble",
    },
    android: {
      package: "co.noquarter.ramble",
      app_name: "Ramble",
    },
    web: {
      url: "https://ramble.guide",
      should_fallback: true,
    },
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <PosthogProvider>
        <TRPCReactProvider>
          <TooltipProvider>
            <body className={font.className}>
              <Nav />
              <PostHogPageView />
              <div className="pt-nav">{children}</div>
            </body>
          </TooltipProvider>
        </TRPCReactProvider>
      </PosthogProvider>
    </html>
  )
}
