import { AccessRequestAdminEmail, AccessRequestEmail } from "@ramble/emails"

import { FULL_WEB_URL } from "../../lib/config"
import { mailer } from "../../lib/mailer.server"

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
export async function sendAccessRequestConfirmationToAdminsEmail(adminEmails: string[], email: string) {
  try {
    const link = `${FULL_WEB_URL}/admin/access-requests`
    await mailer.send({
      react: <AccessRequestAdminEmail link={link} email={email} />,
      to: adminEmails,
      text: `Access request for Ramble`,
      subject: "Access request for Ramble",
    })
  } catch (error) {
    console.log(error)
  }
}
