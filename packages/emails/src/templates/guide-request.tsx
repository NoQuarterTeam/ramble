import { Container, Img } from "@react-email/components"

import type { User } from "@ramble/database/types"
import { createAssetUrl } from "@ramble/shared"

import { Button } from "../components/Button"
import { EmailDocument } from "../components/EmailDocument"
import { EmailWrapper } from "../components/EmailWrapper"
import { Heading } from "../components/Heading"

export interface GuideRequestProps {
  user: Pick<User, "avatar" | "firstName" | "lastName" | "username">
  link: string
}

export function GuideRequestContent(props: GuideRequestProps) {
  return (
    <EmailWrapper>
      <Heading className="mb-4">new guide request</Heading>
      <p className="mb-8">Someone wants to be a guide on Ramble:</p>
      <Container className="mb-8 flex flex-col items-center rounded-xs border border-gray-[rgba(120,120,120,0.9)] border-solid p-10 text-center">
        <Img className="mx-auto mb-4 h-[100px] w-[100px] rounded-full object-cover" src={createAssetUrl(props.user.avatar)} />
        <p>
          {props.user.firstName} {props.user.lastName}
        </p>
      </Container>
      <Button href={props.link}>Go to profile</Button>
    </EmailWrapper>
  )
}

export function GuideRequestEmail(props: GuideRequestProps) {
  return (
    <EmailDocument preview="Guide request">
      <GuideRequestContent {...props} />
    </EmailDocument>
  )
}
