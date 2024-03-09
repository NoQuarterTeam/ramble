import { sendGuideRequestSentToAdminsEmail } from "@ramble/server-services"

import { useFetcher } from "~/components/Form"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { badRequest, json } from "~/lib/remix.server"
import type { ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { getCurrentUser } from "~/services/auth/auth.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const user = await getCurrentUser(request)
    if (user.role === "GUIDE") return badRequest(null, request, { flash: { title: "You are already a guide" } })
    if (user.role === "OWNER") return badRequest(null, request, { flash: { title: "You are already an owner" } })
    if (user.isPendingGuideApproval) return badRequest(null, request, { flash: { title: "Already pending approval" } })
    await db.user.update({ where: { id: user.id }, data: { isPendingGuideApproval: true } })

    const admins = await db.user.findMany({ where: { isAdmin: true }, select: { email: true } })
    await sendGuideRequestSentToAdminsEmail(
      admins.map((a) => a.email),
      user,
    )
    track("Guide approval requested", { userId: user.id })
    return json(null, request, {
      flash: { title: "Request sent!", description: "We will review your request and get back to you soon." },
    })
  } catch {
    return badRequest(null, request, { flash: { title: "Error submitting request" } })
  }
}

const actionUrl = "/api/guide-request"

export function GuideRequestForm() {
  const fetcher = useFetcher()
  return (
    <fetcher.Form action={actionUrl}>
      <fetcher.FormButton>Become a guide</fetcher.FormButton>
    </fetcher.Form>
  )
}
