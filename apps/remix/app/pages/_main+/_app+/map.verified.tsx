import { useNavigate } from "@remix-run/react"

import { LinkButton } from "~/components/LinkButton"
import { Modal } from "~/components/ui"

export default function Verified() {
  const navigate = useNavigate()

  return (
    <Modal isOpen title="Account verified!" onClose={() => navigate("/map")}>
      <div className="space-y-4">
        <p>You can now create spots!</p>
        <LinkButton to={"/map"}>Let's go</LinkButton>
      </div>
    </Modal>
  )
}
