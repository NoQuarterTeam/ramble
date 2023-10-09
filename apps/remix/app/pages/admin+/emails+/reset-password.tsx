import { sendResetPasswordEmail } from "@ramble/api"
import { ResetPasswordContent } from "@ramble/emails"
import { ActionFunctionArgs } from "@remix-run/node"
import { useConfig } from "~/lib/hooks/useConfig"
import { json } from "~/lib/remix.server"
import { getCurrentAdmin } from "~/services/auth/auth.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentAdmin(request)
  await sendResetPasswordEmail(user, "test")
  return json(true, request, { flash: { title: "Email sent!", description: "Check the email linked to your account" } })
}

export const handle = {
  url: "/admin/emails/reset-password",
}

export default function Template() {
  const config = useConfig()
  const link = `${config.WEB_URL}/admin`
  return <ResetPasswordContent link={link} />
}
