import { sendGuideRequestSentToAdminsEmail } from "@ramble/api"
import { GuideRequestContent } from "@ramble/emails"
import { ActionFunctionArgs } from "@vercel/remix"
import { useConfig } from "~/lib/hooks/useConfig"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { json } from "~/lib/remix.server"
import { getCurrentAdmin } from "~/services/auth/auth.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentAdmin(request)
  await sendGuideRequestSentToAdminsEmail([user.email], user)
  return json(true, request, { flash: { title: "Email sent!", description: "Check the email linked to your account" } })
}

export const handle = {
  url: "/admin/emails/guide-request",
}

export default function Template() {
  const config = useConfig()
  const user = useMaybeUser()
  if (!user) return null
  const link = `${config.WEB_URL}/${user.username}`
  return <GuideRequestContent link={link} user={user} />
}
