import { type User } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"
import { Button } from "../components/Button"
import { EmailDocument } from "../components/EmailDocument"
import { EmailWrapper } from "../components/EmailWrapper"
import { Container, Img } from "@react-email/components"
import { Link } from "../components/Link"

export interface GuideRequestProps {
  user: Pick<User, "avatar" | "firstName" | "lastName" | "username">
  link: string
}

export function GuideRequestContent(props: GuideRequestProps) {
  return (
    <EmailWrapper preview="Guide request">
      <h1 className="mb-4 text-2xl font-bold">Guide request</h1>
      <p className="mb-8">Someone wants to be a guide on Ramble:</p>
      <Container className="rounded-xs mb-8 flex flex-col items-center border bg-gray-800 p-10 text-center">
        <Img className="mx-auto mb-4 h-[100px] w-[100px] rounded-full object-contain" src={createImageUrl(props.user.avatar)} />
        <p>
          {props.user.firstName} {props.user.lastName}
        </p>
      </Container>

      <Button href={props.link}>Go to profile</Button>
      <Link href={props.link}>{props.link}</Link>
    </EmailWrapper>
  )
}

export function GuideRequestEmail(props: GuideRequestProps) {
  return (
    <EmailDocument>
      <GuideRequestContent {...props} />
    </EmailDocument>
  )
}
