import type { User } from "@ramble/database/types"
import { FULL_WEB_URL } from "@ramble/server-env"
import * as Sentry from "@sentry/nextjs"

import { ResetPasswordEmail, VerifyAccountEmail } from "@ramble/emails"
import { mailer } from "../lib/mailer"

export async function sendResetPasswordEmail(user: Pick<User, "email">, token: string) {
  try {
    if (!user.email) return
    const link = `${FULL_WEB_URL}/reset-password/${token}`
    await mailer.send({
      react: <ResetPasswordEmail link={link} />,
      to: user.email,
      text: `Reset your password: ${link}`,
      subject: "Reset Password",
    })
  } catch (error) {
    Sentry.captureException(error)
  }
}

export async function sendAccountVerificationEmail(user: Pick<User, "email">, token: string) {
  try {
    const link = `${FULL_WEB_URL}/api/verify/${token}`
    if (!user.email) return

    await mailer.send({
      react: <VerifyAccountEmail link={link} />,
      to: user.email,
      text: `Verify email: ${link}`,
      subject: "Verify email",
    })
  } catch (error) {
    Sentry.captureException(error)
  }
}
