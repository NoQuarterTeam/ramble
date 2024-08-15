import { useLocalSearchParams, useRouter } from "expo-router"
import { ScrollView } from "react-native"

import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"

import { ReviewForm } from "../../../../../../components/ReviewForm"

export default function ReviewDetailScreen() {
  useKeyboardController()
  const { reviewId } = useLocalSearchParams<{ reviewId: string }>()

  const router = useRouter()
  const utils = api.useUtils()
  const { data: review, isLoading: reviewLoading } = api.review.detail.useQuery({ id: reviewId })

  const {
    mutate,
    isPending: isLoading,
    error,
  } = api.review.update.useMutation({
    onSuccess: async () => {
      if (!review) return
      void utils.spot.detail.refetch({ id: review.spotId })
      void utils.spot.mapPreview.refetch({ id: review.spotId })
      void utils.review.detail.refetch({ id: reviewId })
      router.back()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({ title: "Review updated" })
    },
  })

  return (
    <ModalView title="edit review">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {reviewLoading ? null : !review ? (
          <Text>Review not found</Text>
        ) : (
          <ReviewForm
            review={review}
            spotId={review.spotId}
            spotType={review.spot.type}
            isLoading={isLoading}
            error={error}
            onUpdate={(data) => mutate({ ...data, id: reviewId })}
          />
        )}
      </ScrollView>
    </ModalView>
  )
}
