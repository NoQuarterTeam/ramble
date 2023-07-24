import { useNavigate } from "@remix-run/react"

import { LinkButton } from "~/components/LinkButton"
import { Modal } from "~/components/ui"

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <Modal isOpen title="Welcome to Ramble!" onClose={() => navigate(`/map`)}>
      <div className="space-y-4">
        <p>We've sent a verification email to you, please follow the link to verify your account</p>
        <hr />
        <p>Jump in and start finding your new favourite spots</p>
        <LinkButton to={`/map`}>Let's go</LinkButton>
      </div>
    </Modal>
  )
}
