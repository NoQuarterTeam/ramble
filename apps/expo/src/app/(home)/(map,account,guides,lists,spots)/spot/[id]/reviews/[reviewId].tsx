import { ScrollView } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"

import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"

import { ReviewForm } from "./ReviewForm"

export default function ReviewDetailScreen() {
  useKeyboardController()
  const { reviewId } = useLocalSearchParams<{ reviewId: string }>()

  const router = useRouter()
  const utils = api.useUtils()
  const { data: review, isLoading: reviewLoading } = api.review.detail.useQuery({ id: reviewId })

  const { mutate, isLoading, error } = api.review.update.useMutation({
    onSuccess: () => {
      if (!review) return
      utils.spot.detail.refetch({ id: review.spotId })
      utils.spot.mapPreview.refetch({ id: review.spotId })
      toast({ title: "Review updated" })
      router.back()
    },
  })

  return (
    <ModalView title="edit review">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {reviewLoading ? null : !review ? (
          <Text>Review not found</Text>
        ) : (
          <ReviewForm
            review={review}
            spotId={review?.spotId}
            isLoading={isLoading}
            error={error}
            onUpdate={(data) => mutate({ ...data, id: reviewId })}
          />
        )}
      </ScrollView>
    </ModalView>
  )
}
