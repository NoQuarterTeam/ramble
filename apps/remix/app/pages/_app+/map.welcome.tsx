import { useNavigate } from "@remix-run/react"

import { Modal } from "@travel/ui"

import { LinkButton } from "~/components/LinkButton"

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <Modal isOpen title="Welcome to Travel!" onClose={() => navigate(`/map${window.location.search}`)}>
      <div className="space-y-4">
        <p>Jump in and start finding your new favourite spots</p>
        <LinkButton colorScheme="primary" to={`/map${window.location.search}`}>
          Let&apos;s go
        </LinkButton>
      </div>
    </Modal>
  )
}
