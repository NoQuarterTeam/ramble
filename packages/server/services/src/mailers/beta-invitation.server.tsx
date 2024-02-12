import { BetaInvitationEmail } from "@ramble/emails"
import { mailer } from "../lib/mailer.server"

export async function sendBetaInvitationEmail(email: string, code: string) {
  try {
    await mailer.send({
      react: <BetaInvitationEmail code={code} />,
      to: email,
      text: `Invitation to the Ramble beta`,
      subject: "Invitation to the Ramble beta",
    })
  } catch (error) {
    console.log(error)
  }
}
