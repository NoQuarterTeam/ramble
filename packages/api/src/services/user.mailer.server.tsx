import type { User } from "@ramble/database/types"
import { ResetPasswordEmail, VerifyEmail } from "@ramble/emails"

import { FULL_WEB_URL } from "../lib/config"
import { mailer } from "../lib/mailer.server"

export async function sendResetPasswordEmail(user: Pick<User, "email">, token: string) {
  try {
    if (!user.email) return
    const link = `${FULL_WEB_URL}/reset-password/${token}`
    await mailer.send({
      react: <ResetPasswordEmail link={link} />,
      to: user.email,
      text: `Reset your password: ${link}`,
      from: "info@noquarter.co",
      subject: "Reset Password",
    })
  } catch (error) {
    console.log(error)
  }
}

export async function sendAccountVerificationEmail(user: Pick<User, "email">, token: string) {
  try {
    const link = `${FULL_WEB_URL}/api/verify/${token}`
    if (!user.email) return

    await mailer.send({
      react: <VerifyEmail link={link} />,
      to: user.email,
      text: `Verify email: ${link}`,
      from: "info@noquarter.co",
      subject: "Verify email",
    })
  } catch (error) {
    console.log(error)
  }
}
