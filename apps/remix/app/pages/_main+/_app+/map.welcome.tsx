import { useLoaderData, useLocation, useNavigate } from "@remix-run/react"

import { LinkButton } from "~/components/LinkButton"
import { Modal } from "~/components/ui"
import { type LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { getCurrentUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request, { accessRequest: true })
  if (user.accessRequest?.acceptedAt) return true
  return false
}

export default function Welcome() {
  const wasInvited = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Modal isOpen title="Welcome to Ramble!" onClose={() => navigate(`/map${location.search}`)}>
      <div className="space-y-4">
        {!wasInvited && (
          <>
            <p>We've sent a verification email to you, please follow the link to verify your account</p>
            <hr />
          </>
        )}
        <p>Jump in and start finding your new favourite spots</p>
        <LinkButton to={`/map${location.search}`}>Let's go</LinkButton>
      </div>
    </Modal>
  )
}
