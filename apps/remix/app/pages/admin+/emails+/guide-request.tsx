import { sendGuideRequestSentToAdminsEmail } from "@ramble/server-services"

import { useConfig } from "~/lib/hooks/useConfig"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { json } from "~/lib/remix.server"
import { type ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { getCurrentAdmin } from "~/services/auth/auth.server"

import { GuideRequestContent } from "@ramble/emails"
import { type TemplateHandle } from "./_layout"

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentAdmin(request)
  await sendGuideRequestSentToAdminsEmail([user.email], user)
  return json(true, request, { flash: { title: "Email sent!", description: "Check the email linked to your account" } })
}

export const handle: TemplateHandle = {
  url: "/admin/emails/guide-request",
}

export default function Template() {
  const config = useConfig()
  const user = useMaybeUser()
  if (!user) return null
  const link = `${config.FULL_WEB_URL}/${user.username}`
  return <GuideRequestContent link={link} user={user} />
}
