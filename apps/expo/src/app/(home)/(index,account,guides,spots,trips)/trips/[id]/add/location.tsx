import { Map } from "~/components/Map"

import { Input } from "~/components/ui/Input"

import { ModalView } from "~/components/ui/ModalView"

export default function AddItemLocationScreen() {
  return (
    <ModalView title="location">
      <Input />
      <Map />
    </ModalView>
  )
}
