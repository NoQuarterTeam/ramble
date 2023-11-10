import { EmailDocument } from "../components/EmailDocument"
import { EmailWrapper } from "../components/EmailWrapper"
import { Heading } from "../components/Heading"

export function AccessRequestContent() {
  return (
    <EmailWrapper>
      <Heading className="mb-4">request received</Heading>
      <p className="mb-8">Thanks you for requesting to join the beta!</p>
      <p className="mb-8">We will be in touch very soon.</p>
    </EmailWrapper>
  )
}

export function AccessRequestEmail() {
  return (
    <EmailDocument preview="Access request">
      <AccessRequestContent />
    </EmailDocument>
  )
}
