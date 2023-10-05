import { FeedbackSentEmail, FeedbackSentProps } from "@ramble/emails"
import { mailer } from "../lib/mailer.server"
import { FULL_WEB_URL } from "../lib/config"

export async function sendFeedbackSentToAdminsEmail(adminEmails: string[], feedback: FeedbackSentProps["feedback"]) {
  try {
    const link = `${FULL_WEB_URL}/admin/feedback`

    await mailer.send({
      react: <FeedbackSentEmail link={link} feedback={feedback} />,
      to: adminEmails,
      text: `Feedback sent for Ramble`,
      subject: "Feedback sent for Ramble",
    })
  } catch (error) {
    console.log(error)
  }
}
