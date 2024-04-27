import { ResetPasswordContent } from "@ramble/emails"

export default function Template() {
  const link = "/admin"
  return <ResetPasswordContent link={link} />
}
