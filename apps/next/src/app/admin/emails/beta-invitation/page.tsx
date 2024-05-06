import { BetaInvitationContent } from "@ramble/emails"
import { FULL_WEB_URL } from "@ramble/server-env"

export default function Template() {
  const code = "A123456"
  const email = "ramble@noquarter.co"
  return <BetaInvitationContent code={code} link={`${FULL_WEB_URL}/register?code=${code}&email=${email}`} />
}
