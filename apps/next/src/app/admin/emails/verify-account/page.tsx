import { VerifyAccountContent } from "@ramble/emails"

export default function Template() {
  const link = "/admin"
  return <VerifyAccountContent link={link} />
}
