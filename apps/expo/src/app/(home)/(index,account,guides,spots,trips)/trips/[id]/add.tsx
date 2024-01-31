import { useLocalSearchParams } from "expo-router"
import { Map } from "~/components/Map"

import { ModalView } from "~/components/ui/ModalView"

export default function NewItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  console.log(id)

  return (
    <ModalView title="add item">
      <Map />
    </ModalView>
  )
}
