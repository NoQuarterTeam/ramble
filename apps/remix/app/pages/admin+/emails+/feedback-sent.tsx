import { sendFeedbackSentToAdminsEmail } from "@ramble/api"
import { type FeedbackType } from "@ramble/database/types"
import { FeedbackSentContent } from "@ramble/emails"
import { ActionFunctionArgs } from "@vercel/remix"
import { useConfig } from "~/lib/hooks/useConfig"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { json } from "~/lib/remix.server"
import { getCurrentAdmin } from "~/services/auth/auth.server"

const testFeedback = {
  message: "Wow this is really quite cool, needs more cowbell",
  type: "IDEA" as FeedbackType,
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentAdmin(request)
  await sendFeedbackSentToAdminsEmail([user.email], { ...testFeedback, user })
  return json(true, request, { flash: { title: "Email sent!", description: "Check the email linked to your account" } })
}

export const handle = {
  url: "/admin/emails/feedback-sent",
}

export default function Template() {
  const config = useConfig()
  const link = `${config.WEB_URL}/admin/feedback`
  const user = useMaybeUser()
  if (!user) return null
  return <FeedbackSentContent link={link} feedback={{ ...testFeedback, user }} />
}
