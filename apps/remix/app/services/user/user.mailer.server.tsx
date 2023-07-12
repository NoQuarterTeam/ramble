import type { User } from "@ramble/database/types"
import { ResetPasswordEmail } from "@ramble/emails"

import { FULL_WEB_URL } from "~/lib/config.server"
import { mailer } from "~/lib/mailer.server"

export async function sendResetPasswordEmail(user: User, token: string) {
  try {
    if (!user.email) return

    await mailer.send({
      react: <ResetPasswordEmail link={`${FULL_WEB_URL}/reset-password/${token}`} />,
      to: user.email,
      text: `Reset your password: ${FULL_WEB_URL}/reset-password/${token}`,
      from: "info@noquarter.co",
      subject: "Reset Password",
    })
  } catch (error) {
    console.log(error)
  }
}
