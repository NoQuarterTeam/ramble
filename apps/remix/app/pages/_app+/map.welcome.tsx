import { useNavigate, useSearchParams } from "@remix-run/react"

import { Modal } from "@travel/ui"

import { LinkButton } from "~/components/LinkButton"

export default function Welcome() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  return (
    <Modal isOpen title="Welcome to Travel!" onClose={() => navigate(`/map?${searchParams.toString()}`)}>
      <div className="space-y-4">
        <p>Jump in and start finding your new favourite spots</p>
        <LinkButton colorScheme="primary" to={`/map?${searchParams.toString()}`}>
          Let&apos;s go
        </LinkButton>
      </div>
    </Modal>
  )
}
