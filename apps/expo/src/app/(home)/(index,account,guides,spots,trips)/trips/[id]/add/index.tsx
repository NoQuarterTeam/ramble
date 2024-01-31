import { Link, useLocalSearchParams } from "expo-router"
import { ScrollView } from "react-native"
import { Button } from "~/components/ui/Button"

import { ModalView } from "~/components/ui/ModalView"

export default function NewItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <ModalView title="add item">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Link asChild push href={`/(home)/(trips)/trips/${id}/add/location`}>
          <Button>Location</Button>
        </Link>
        <Button>Spot</Button>
      </ScrollView>
    </ModalView>
  )
}
