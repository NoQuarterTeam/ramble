import { type Feedback, type User } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"
import { Button } from "../components/Button"
import { EmailDocument } from "../components/EmailDocument"
import { EmailWrapper } from "../components/EmailWrapper"
import { Container, Img } from "@react-email/components"

export interface FeedbackSentProps {
  feedback: Pick<Feedback, "message" | "type"> & { user: Pick<User, "avatar" | "firstName" | "lastName"> }
  link: string
}

export function FeedbackSentContent(props: FeedbackSentProps) {
  return (
    <EmailWrapper>
      <h1 className="mb-4 text-2xl font-bold">Feedback</h1>
      <p className="mb-8">Someone submitted some feedback to Ramble:</p>
      <Container className="rounded-xs mb-8 flex flex-col items-center border border-solid border-gray-700 bg-gray-800 p-10 text-center">
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
