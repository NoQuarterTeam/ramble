import { AccessRequestEmail } from "@ramble/emails"
import { mailer } from "../lib/mailer"

export async function sendAccessRequestConfirmationEmail(email: string) {
  mailer.send({
    react: <AccessRequestEmail />,
    to: email,
    text: "Request confirmation for Ramble",
    subject: "Request confirmation for Ramble",
  })
}
