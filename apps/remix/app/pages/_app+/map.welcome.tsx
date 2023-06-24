import { useNavigate } from "@remix-run/react"

import { LinkButton } from "~/components/LinkButton"
import { Modal } from "~/components/ui"

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <Modal isOpen title="Welcome to Ramble!" onClose={() => navigate(`/map${window.location.search}`)}>
      <div className="space-y-4">
        <p>Jump in and start finding your new favourite spots</p>
        <LinkButton to={`/map${window.location.search}`}>Let's go</LinkButton>
      </div>
    </Modal>
  )
}
