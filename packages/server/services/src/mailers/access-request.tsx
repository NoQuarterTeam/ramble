import { AccessRequestEmail } from "@ramble/emails"
import * as Sentry from "@sentry/nextjs"
import { mailer } from "../lib/mailer"

export async function sendAccessRequestConfirmationEmail(email: string) {
  try {
    await mailer.send({
      react: <AccessRequestEmail />,
      to: email,
      text: "Request confirmation for Ramble",
      subject: "Request confirmation for Ramble",
    })
  } catch (error) {
    Sentry.captureException(error)
  }
}
