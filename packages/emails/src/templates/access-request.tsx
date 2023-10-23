import { Container } from "@react-email/components"

import { Button } from "../components/Button"
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
export interface AccessRequestAdminProps {
  email: string
  link: string
}

export function AccessRequestAdminContent(props: AccessRequestAdminProps) {
  return (
    <EmailWrapper>
      <Heading className="mb-4">new access request</Heading>
      <p className="mb-8">Someone wants to join the beta:</p>
      <Container className="rounded-xs border-gray-[rgba(120,120,120,0.9)] mb-8 flex flex-col items-center border border-solid p-10 text-center">
        <p>{props.email}</p>
      </Container>
      <Button href={props.link}>Go to requests</Button>
    </EmailWrapper>
  )
}

export function AccessRequestAdminEmail(props: AccessRequestAdminProps) {
  return (
    <EmailDocument preview="Access request">
      <AccessRequestAdminContent {...props} />
    </EmailDocument>
  )
}
