import { sendBetaInvitationEmail } from "@ramble/server-services"

import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { json } from "~/lib/remix.server"
import { type ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { getCurrentAdmin } from "~/services/auth/auth.server"

import { BetaInvitationContent } from "@ramble/emails"
import { type TemplateHandle } from "./_layout"

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentAdmin(request)
  await sendBetaInvitationEmail(user.email, "A123F423")
  return json(true, request, { flash: { title: "Email sent!", description: "Check the email linked to your account" } })
}

export const handle: TemplateHandle = {
  url: "/admin/emails/beta-invitation",
}

export default function Template() {
  const user = useMaybeUser()
  if (!user) return null
  return <BetaInvitationContent code="A123F423" />
}
