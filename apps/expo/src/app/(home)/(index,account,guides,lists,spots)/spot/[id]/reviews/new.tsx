import { ScrollView } from "react-native"

import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ReviewForm } from "./ReviewForm"

export default function NewReviewScreen() {
  useKeyboardController()
  const { id } = useLocalSearchParams<{ id: string }>()

  const router = useRouter()
  const utils = api.useUtils()
  const { mutate, isLoading, error } = api.review.create.useMutation({
    onSuccess: () => {
      utils.spot.detail.refetch({ id })
      utils.spot.mapPreview.refetch({ id })
      router.back()
    },
  })
  const { data } = api.spot.detail.useQuery({ id })
  const spot = data?.spot
  return (
    <ModalView title="new review">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="pb-4">{spot?.name}</Text>
        <ReviewForm isLoading={isLoading} error={error} onCreate={mutate} spotId={id} />
      </ScrollView>
    </ModalView>
  )
}
