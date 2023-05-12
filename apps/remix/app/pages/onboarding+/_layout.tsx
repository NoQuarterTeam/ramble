import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import { ArrowRight } from "lucide-react"

import { LinkButton } from "~/components/LinkButton"
import { requireUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request)
  return json(null)
}

export default function OnboardingLayout() {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-32 pt-10 md:pt-20">
      <div className="flex items-center justify-between">
        <h2 className="font-normal">Account setup</h2>
        <LinkButton to="/map" variant="ghost" rightIcon={<ArrowRight className="sq-4" />}>
          Skip<span className="ml-1 hidden md:inline">onboarding</span>
        </LinkButton>
      </div>
      <Outlet />
    </div>
  )
}
