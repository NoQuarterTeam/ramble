import { useLocalSearchParams, useRouter } from "expo-router"
import { TripForm } from "~/components/TripForm"
import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"

export default function EditTrip() {
  const { id } = useLocalSearchParams<{ id: string }>()
  useKeyboardController()
  const utils = api.useUtils()
  const router = useRouter()
  const { data, isLoading: tripLoading } = api.trip.info.useQuery({ id })

  const { mutate, isLoading, error } = api.trip.update.useMutation({
    onSuccess: async (data) => {
      utils.trip.info.refetch({ id })
      utils.trip.detail.setData({ id }, (prev) => (prev ? { ...prev, trip: { ...prev.trip, ...data } } : prev))
      router.back()
    },
  })

  return (
    <ModalView title="edit trip">
      {tripLoading ? null : !data ? (
        <Text>List not found</Text>
      ) : (
        <TripForm trip={data} isLoading={isLoading} error={error} onUpdate={(data) => mutate({ ...data, id })} />
      )}
    </ModalView>
  )
}
