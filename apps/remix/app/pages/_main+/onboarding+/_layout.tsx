import { Outlet } from "@remix-run/react"
import type { LoaderFunctionArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { ArrowRight } from "lucide-react"

import { LinkButton } from "~/components/LinkButton"
import { requireUser } from "~/services/auth/auth.server"

import { PageContainer } from "../../../components/PageContainer"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUser(request)
  return json(null)
}

export default function OnboardingLayout() {
  return (
    <PageContainer className="min-h-screen pb-32 pt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-normal">Account setup</h2>
        <LinkButton to="/map" variant="ghost" rightIcon={<ArrowRight className="sq-4" />}>
          Skip<span className="ml-1 hidden md:inline">onboarding</span>
        </LinkButton>
      </div>
      <Outlet />
    </PageContainer>
  )
}
