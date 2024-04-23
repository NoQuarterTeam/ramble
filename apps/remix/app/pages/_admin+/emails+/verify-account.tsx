import { sendAccountVerificationEmail } from "@ramble/server-services"

import { useConfig } from "~/lib/hooks/useConfig"
import { json } from "~/lib/remix.server"
import type { ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { getCurrentAdmin } from "~/services/auth/auth.server"

import { VerifyAccountContent } from "@ramble/emails"
import type { TemplateHandle } from "./_layout"

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentAdmin(request)
  await sendAccountVerificationEmail(user, "test")
  return json(true, request, { flash: { title: "Email sent!", description: "Check the email linked to your account" } })
}

export const handle: TemplateHandle = {
  url: "/admin/emails/verify-account",
}

export default function Template() {
  const config = useConfig()
  const link = `${config.FULL_WEB_URL}/admin`
  return <VerifyAccountContent link={link} />
}
