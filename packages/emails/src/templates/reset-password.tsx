import { Button } from "../components/Button"
import { EmailDocument } from "../components/EmailDocument"
import { EmailWrapper } from "../components/EmailWrapper"

interface Props {
  link: string
}

export function ResetPasswordContent(props: Props) {
  return (
    <EmailWrapper>
      <h1 className="mb-4 text-2xl font-bold">Reset Password</h1>
      <p className="mb-4">
        Someone recently requested a password change for your Ramble account. If this was you, you can set a new password here:
      </p>
      <Button className="mb-4" href={props.link}>
        Reset password
      </Button>
      <p>If you don't want to change your password or didn't request this, just ignore and delete this message.</p>
    </EmailWrapper>
  )
}

export function ResetPasswordEmail(props: Props) {
  return (
    <EmailDocument preview="Ramble reset your password">
      <ResetPasswordContent {...props} />
    </EmailDocument>
  )
}
