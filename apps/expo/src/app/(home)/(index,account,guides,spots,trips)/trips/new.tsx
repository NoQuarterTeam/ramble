import { ScrollView, Text } from "react-native"
import { useRouter } from "expo-router"

import { ModalView } from "~/components/ui/ModalView"
import { api, type RouterInputs } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"
import { TripForm } from "~/components/TripForm"

export default function NewTripScreen() {
  const router = useRouter()
  const { me } = useMe()
  const utils = api.useUtils()
  const { mutate, error, isLoading } = api.trip.create.useMutation({
    onSuccess: () => {
      if (!me) return
      utils.user.trips.refetch()
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
