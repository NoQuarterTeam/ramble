import { Button } from "../components/Button"
import { EmailDocument } from "../components/EmailDocument"
import { EmailWrapper } from "../components/EmailWrapper"
import { Heading } from "../components/Heading"

interface Props {
  link: string
}

export function BetaInvitationContent(props: Props) {
  return (
    <EmailWrapper>
      <Heading className="mb-4">You now have access to the Ramble beta</Heading>
      <p className="mb-4">
        Thank you for signing up! We look forward to working together with you to build the ultimate van life travel app.
      </p>
      <p className="mb-4">
        You are one of the very first members of a growing intimate community built around a shared love of nature, supporting
        local communities whilst traveling.
      </p>
      <Button href={props.link}>Sign in</Button>
    </EmailWrapper>
  )
}
export function BetaInvitationEmail(props: Props) {
  return (
    <EmailDocument>
      <BetaInvitationContent {...props} />
    </EmailDocument>
  )
}
