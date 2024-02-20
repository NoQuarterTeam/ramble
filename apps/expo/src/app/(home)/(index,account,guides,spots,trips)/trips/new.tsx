import { useRouter } from "expo-router"
import { usePostHog } from "posthog-react-native"
import { ScrollView } from "react-native"

import { TripForm } from "~/components/TripForm"
import { ModalView } from "~/components/ui/ModalView"
import { api } from "~/lib/api"

export default function NewTripScreen() {
  const router = useRouter()

  const posthog = usePostHog()
  const utils = api.useUtils()
  const { mutate, error, isLoading } = api.trip.create.useMutation({
    onSuccess: (data) => {
      posthog?.capture("trip created", { name: data.name })
      utils.trip.upcoming.refetch()
      utils.trip.complete.refetch()
      router.back()
      router.push(`/(home)/(trips)/trips/${data.id}`)
    },
  })

  return (
    <ModalView title="new trip">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <TripForm onCreate={(data) => mutate(data)} isLoading={isLoading} error={error} />
      </ScrollView>
    </ModalView>
  )
}
