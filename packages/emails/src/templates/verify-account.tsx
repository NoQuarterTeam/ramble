import { EmailWrapper } from "../components/EmailWrapper"
import { EmailDocument } from "../components/EmailDocument"
import { Button } from "../components/Button"
import { Link } from "../components/Link"

interface Props {
  link: string
}

export function VerifyAccountContent(props: Props) {
  return (
    <EmailWrapper>
      <h1 className="mb-4 text-2xl font-bold">Verify account</h1>
      <p className="mb-4">To keep access to your account, please verify your email address.</p>
      <Button href={props.link}>Verify account</Button>
      <Link href={props.link}>{props.link}</Link>
    </EmailWrapper>
  )
}
export function VerifyAccountEmail(props: Props) {
  return (
    <EmailDocument>
      <VerifyAccountContent {...props} />
    </EmailDocument>
  )
}
