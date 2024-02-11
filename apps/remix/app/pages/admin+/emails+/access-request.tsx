import { sendAccessRequestConfirmationEmail } from "@ramble/server-services"

import { json } from "~/lib/remix.server"
import { type ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { getCurrentAdmin } from "~/services/auth/auth.server"

import { AccessRequestContent } from "@ramble/emails"
import { type TemplateHandle } from "./_layout"

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentAdmin(request)
  await sendAccessRequestConfirmationEmail(user.email)
  return json(true, request, { flash: { title: "Email sent!", description: "Check the email linked to your account" } })
}

export const handle: TemplateHandle = {
  url: "/admin/emails/access-request",
}

export default function Template() {
  return <AccessRequestContent />
}
