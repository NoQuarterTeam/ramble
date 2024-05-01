import { BetaInvitationEmail } from "@ramble/emails"
import * as Sentry from "@sentry/nextjs"
import { mailer } from "../lib/mailer"

export async function sendBetaInvitationEmail(email: string, code: string) {
  try {
    await mailer.send({
      react: <BetaInvitationEmail code={code} />,
      to: email,
      text: "Invitation to the Ramble beta",
      subject: "Invitation to the Ramble beta",
    })
  } catch (error) {
    Sentry.captureException(error)
  }
}
