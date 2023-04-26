import Link from "next/link"

import { ClientOnly } from "@travel/shared"
import { Badge, Limiter } from "@travel/ui"

import { HomeBackground } from "~/components/HomeBackground"
import { ThemeSwitcher } from "~/components/ThemeSwitcher"

export default async function Home() {
  return (
    <div className="relative min-h-screen">
      <ClientOnly>
        <HomeBackground />
      </ClientOnly>
      <div className="border-b border-solid border-gray-50 dark:border-gray-700">
        <Limiter className="bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between py-5 align-middle">
            <div className="hstack h-12 space-x-6">
              <Link href="/">
                <div className="hstack">
                  <p className="text-xl font-semibold">Travel</p>
                </div>
              </Link>
            </div>
            <ClientOnly>
              <ThemeSwitcher />
            </ClientOnly>
          </div>
        </Limiter>
      </div>

      <Limiter className="pt-16">
        <div className="stack space-y-20">
          <div className="center flex-col">
            <div className="vstack max-w-lg space-y-6 pb-12 text-center">
              <Badge size="lg" colorScheme="green">
                Beta
              </Badge>
              <h1 className="text-5xl leading-tight">Welcome to the Travel</h1>
              <p className="text-2xl">Next.js coming soon</p>
            </div>
          </div>
        </div>
      </Limiter>
    </div>
  )
}
