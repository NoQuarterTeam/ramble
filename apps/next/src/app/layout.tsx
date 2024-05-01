import { Nav } from "@/components/Nav"
import { PosthogProvider } from "@/components/PosthogProvider"
import { TooltipProvider } from "@/components/TooltipProvider"
import { TRPCReactProvider } from "@/lib/trpc/react"
import { Toaster } from "sonner"
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
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
      </head>
      <PosthogProvider>
        <TRPCReactProvider>
          <TooltipProvider>
            <body className={font.className}>
              <Nav />
              <Toaster />
              <PostHogPageView />
              <div className="pt-nav">{children}</div>
            </body>
          </TooltipProvider>
        </TRPCReactProvider>
      </PosthogProvider>
    </html>
  )
}
