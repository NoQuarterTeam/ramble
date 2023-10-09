import { type Feedback, type User } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"
import { Button } from "../components/Button"
import { EmailDocument } from "../components/EmailDocument"
import { EmailWrapper } from "../components/EmailWrapper"
import { Container, Img } from "@react-email/components"
import { Heading } from "../components/Heading"

export interface FeedbackSentProps {
  feedback: Pick<Feedback, "message" | "type"> & { user: Pick<User, "avatar" | "firstName" | "lastName"> }
  link: string
}

export function FeedbackSentContent(props: FeedbackSentProps) {
  return (
    <EmailWrapper>
      <Heading className="mb-4">new feedback</Heading>
      <p className="mb-8">Someone submitted some feedback to Ramble:</p>
      <Container className="rounded-xs border-gray-[rgba(120,120,120,0.9)] mb-8 flex flex-col items-center border border-solid px-2 py-10 text-center">
        <p className="mb-4">
          {props.feedback.type} - "{props.feedback.message}"
        </p>
        <Img
          className="mx-auto mb-4 h-[100px] w-[100px] rounded-full object-contain"
          src={createImageUrl(props.feedback.user.avatar)}
        />
        <p>
          {props.feedback.user.firstName} {props.feedback.user.lastName}
        </p>
      </Container>

      <Button href={props.link}>Show all feedback</Button>
    </EmailWrapper>
  )
}

export function FeedbackSentEmail(props: FeedbackSentProps) {
  return (
    <EmailDocument preview={`${props.feedback.user.firstName} submitted some feedback to Ramble`}>
      <FeedbackSentContent {...props} />
    </EmailDocument>
  )
}
