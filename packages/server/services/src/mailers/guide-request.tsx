import { FULL_WEB_URL } from "@ramble/server-env"

import { GuideRequestEmail, type GuideRequestProps } from "@ramble/emails"
import { mailer } from "../lib/mailer"

export async function sendGuideRequestSentToAdminsEmail(adminEmails: string[], user: GuideRequestProps["user"]) {
  try {
    const link = `${FULL_WEB_URL}/${user.username}`
    await mailer.send({
      react: <GuideRequestEmail link={link} user={user} />,
      to: adminEmails,
      text: "Guide request for Ramble",
      subject: "Guide request for Ramble",
    })
  } catch (error) {
    console.log(error)
  }
}
