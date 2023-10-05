import { EmailWrapper } from "../components/EmailWrapper"
import { EmailDocument } from "../components/EmailDocument"
import { Button } from "../components/Button"

interface Props {
  link?: string
}

export function VerifyAccountContent(props: Props) {
  const link = props.link || "localhost:3000"
  return (
    <EmailWrapper>
      <h1 className="mb-4 text-2xl font-bold">Verify account</h1>
      <p className="mb-4">To keep access to your account, please verify your email address.</p>
      <Button href={link}>Verify account</Button>
      <a href={link} className="mb-4 block underline">
        {link}
      </a>
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
