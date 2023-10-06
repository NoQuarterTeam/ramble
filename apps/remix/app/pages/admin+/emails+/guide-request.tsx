import { GuideRequestContent } from "@ramble/emails"
import { useConfig } from "~/lib/hooks/useConfig"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"

export default function Template() {
  const config = useConfig()
  const user = useMaybeUser()
  if (!user) return null
  const link = `${config.WEB_URL}/${user.username}`
  return <GuideRequestContent link={link} user={user} />
}
