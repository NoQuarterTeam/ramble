import type { User } from "@ramble/database/types"
import { FULL_WEB_URL } from "@ramble/server-env"

import { ResetPasswordEmail, VerifyAccountEmail } from "@ramble/emails"
import { mailer } from "../lib/mailer"

export function sendResetPasswordEmail(user: Pick<User, "email">, token: string) {
  if (!user.email) return
  const link = `${FULL_WEB_URL}/reset-password/${token}`
  mailer.send({
    react: <ResetPasswordEmail link={link} />,
    to: user.email,
    text: `Reset your password: ${link}`,
    subject: "Reset Password",
  })
}

export function sendAccountVerificationEmail(user: Pick<User, "email">, token: string) {
  const link = `${FULL_WEB_URL}/api/verify/${token}`
  if (!user.email) return
  mailer.send({
    react: <VerifyAccountEmail link={link} />,
    to: user.email,
    text: `Verify email: ${link}`,
    subject: "Verify email",
  })
}
