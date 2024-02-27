import * as MediaLibrary from "expo-media-library"
import { useRouter } from "expo-router"
import { usePostHog } from "posthog-react-native"
import { ScrollView } from "react-native"

import { TripForm } from "~/components/TripForm"
import { ModalView } from "~/components/ui/ModalView"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"

export default function NewTripScreen() {
  const router = useRouter()
  const utils = api.useUtils()
  const posthog = usePostHog()
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions()

  const { mutate, error, isLoading } = api.trip.create.useMutation({
    onSuccess: (data) => {
      posthog?.capture("trip created", { name: data.name })
      utils.trip.active.refetch()
      utils.trip.mine.refetch()
      router.back()
      router.push(`/(home)/(trips)/trips/${data.id}`)
      if (permissionResponse?.granted) return
      if (permissionResponse?.canAskAgain) return requestPermission()
      return toast({ title: "Please go to your phone settings to grant media library permissions to ramble" })
    },
  })

  return (
    <ModalView title="new trip" shouldRenderToast>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
      >
        <TripForm onCreate={(data) => mutate(data)} isLoading={isLoading} error={error} />
      </ScrollView>
    </ModalView>
  )
}
