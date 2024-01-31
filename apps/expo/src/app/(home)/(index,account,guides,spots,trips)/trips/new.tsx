import { useRouter } from "expo-router"
import { ScrollView } from "react-native"

import { TripForm } from "~/components/TripForm"
import { ModalView } from "~/components/ui/ModalView"
import { api, type RouterInputs } from "~/lib/api"

export default function NewTripScreen() {
  const router = useRouter()

  const utils = api.useUtils()
  const { mutate, error, isLoading } = api.trip.create.useMutation({
    onSuccess: () => {
      utils.trip.mine.refetch()
      router.back()
    },
  })

  const handleSubmit = (data: RouterInputs["trip"]["create"]) => mutate(data)

  return (
    <ModalView title="new trip">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <TripForm onCreate={handleSubmit} isLoading={isLoading} error={error} />
      </ScrollView>
    </ModalView>
  )
}
