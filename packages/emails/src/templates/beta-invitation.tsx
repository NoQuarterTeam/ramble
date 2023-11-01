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
      <Heading className="mb-4">invite to ramble beta</Heading>
      <p className="mb-4">Your request has been accepted! We look forward to your feedback.</p>
      <Button href={props.link}>Join beta here</Button>
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
