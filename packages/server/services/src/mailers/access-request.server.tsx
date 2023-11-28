import { AccessRequestEmail } from "../../../../emails/src"
import { mailer } from "../lib/mailer.server"

export async function sendAccessRequestConfirmationEmail(email: string) {
  try {
    await mailer.send({
      react: <AccessRequestEmail />,
      to: email,
      text: `Request confirmation for Ramble`,
      subject: "Request confirmation for Ramble",
    })
  } catch (error) {
    console.log(error)
  }
}
