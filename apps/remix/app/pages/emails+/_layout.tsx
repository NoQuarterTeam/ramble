import { Outlet } from "@remix-run/react"
import { LoaderFunctionArgs } from "@vercel/remix"
import { LinkButton } from "~/components/LinkButton"
import { json } from "~/lib/remix.server"

import { getCurrentAdmin } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await getCurrentAdmin(request)
  return json(null)
}

export default function Layout() {
  return (
    <div className="bg-background-dark dark flex gap-2">
      <div className="w-[200px] p-4">
        <div>Ramble emails</div>
        <LinkButton to="reset-password">Reset password</LinkButton>
        <LinkButton to="verify-account">Verify account</LinkButton>
      </div>
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  )
}
