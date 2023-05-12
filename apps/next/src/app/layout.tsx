import "./globals.css"

import { Noto_Sans } from "next/font/google"

import { Toaster } from "@ramble/ui"

import { ThemeProvider } from "~/components/ThemeProvider"
import { TooltipProvider } from "~/components/TooltipProvider"

const custom = Noto_Sans({
  subsets: ["latin"],
  preload: true,
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-custom",
})

export const metadata = {
  title: "Ramble",
  description: "Created by No Quarter",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  console.log("render")

  return (
    <html lang="en" className={`${custom.variable}`} suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-800">
        <ThemeProvider attribute="class">
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
