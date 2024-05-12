import { GuideRequestEmail, type GuideRequestProps } from "@ramble/emails"
import { FULL_WEB_URL } from "@ramble/server-env"
import { mailer } from "../lib/mailer"

export function sendGuideRequestSentToAdminsEmail(adminEmails: string[], user: GuideRequestProps["user"]) {
  const link = `${FULL_WEB_URL}/${user.username}`
  mailer.send({
    react: <GuideRequestEmail link={link} user={user} />,
    to: adminEmails,
    text: "Guide request for Ramble",
    subject: "Guide request for Ramble",
  })
}
