import { BetaInvitationEmail } from "@ramble/emails"
import { FULL_WEB_URL } from "@ramble/server-env"
import * as Sentry from "@sentry/nextjs"
import { mailer } from "../lib/mailer"

export async function sendBetaInvitationEmail(email: string, code: string) {
  try {
    const link = `${FULL_WEB_URL}/register?code=${code}&email=${email}`
    await mailer.send({
      react: <BetaInvitationEmail code={code} link={link} />,
      to: email,
      text: "Invitation to the Ramble beta",
      subject: "Invitation to the Ramble beta",
    })
  } catch (error) {
    Sentry.captureException(error)
  }
}
