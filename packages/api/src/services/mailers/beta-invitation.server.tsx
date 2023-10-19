import { BetaInvitationEmail } from "@ramble/emails"

import { FULL_WEB_URL } from "../../lib/config"
import { mailer } from "../../lib/mailer.server"

export async function sendBetaInvitationEmail(email: string, id: string) {
  try {
    const link = `${FULL_WEB_URL}/invitation/${id}`
    await mailer.send({
      react: <BetaInvitationEmail link={link} />,
      to: email,
      text: `Invitation to the Ramble beta`,
      subject: "Invitation to the Ramble beta",
    })
  } catch (error) {
    console.log(error)
  }
}
