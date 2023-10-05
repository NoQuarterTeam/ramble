import { VerifyAccountContent } from "@ramble/emails"
import { useConfig } from "~/lib/hooks/useConfig"

export default function Template() {
  const config = useConfig()
  const link = `${config.WEB_URL}/admin`
  return <VerifyAccountContent link={link} />
}
