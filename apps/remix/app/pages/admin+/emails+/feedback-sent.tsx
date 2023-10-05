import { type FeedbackType } from "@ramble/database/types"
import { FeedbackSentContent } from "@ramble/emails"
import { useConfig } from "~/lib/hooks/useConfig"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"

export default function Template() {
  const config = useConfig()
  const link = `${config.WEB_URL}/admin/feedback`
  const user = useMaybeUser()
  if (!user) return null
  const feedback = {
    user,
    message: "Wow this is really quite cool, needs more cowbell",
    type: "IDEA" as FeedbackType,
  }
  return <FeedbackSentContent link={link} feedback={feedback} />
}
