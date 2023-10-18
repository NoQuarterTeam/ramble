import { Container } from "@react-email/components"

import { Button } from "../components/Button"
import { EmailDocument } from "../components/EmailDocument"
import { EmailWrapper } from "../components/EmailWrapper"
import { Heading } from "../components/Heading"

export interface AccessRequestProps {
  email: string
  link: string
}

export function AccessRequestContent(props: AccessRequestProps) {
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

export function AccessRequestEmail(props: AccessRequestProps) {
  return (
    <EmailDocument preview="Access request">
      <AccessRequestContent {...props} />
    </EmailDocument>
  )
}
