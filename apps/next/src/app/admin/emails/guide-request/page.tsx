import { requireAdmin } from "@/lib/server/auth"
import { GuideRequestContent } from "@ramble/emails"

export default async function Template() {
  const user = await requireAdmin()
  const link = `/${user.username}`
  return <GuideRequestContent link={link} user={user} />
}
