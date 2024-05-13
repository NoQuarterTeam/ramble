import { BetaInvitationEmail } from "@ramble/emails"
import { FULL_WEB_URL } from "@ramble/server-env"

import { mailer } from "../lib/mailer"

export function sendBetaInvitationEmail(email: string, code: string) {
  const link = `${FULL_WEB_URL}/register?code=${code}&email=${email}`
  mailer.send({
    react: <BetaInvitationEmail code={code} link={link} />,
    to: email,
    text: "Invitation to the Ramble beta",
    subject: "Invitation to the Ramble beta",
  })
}
