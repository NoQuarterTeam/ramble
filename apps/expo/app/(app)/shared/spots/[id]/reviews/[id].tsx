import { ScrollView } from "react-native"

import { ModalView } from "../../../../../../components/ui/ModalView"
import { Text } from "../../../../../../components/ui/Text"
import { toast } from "../../../../../../components/ui/Toast"
import { api } from "../../../../../../lib/api"
import { useKeyboardController } from "../../../../../../lib/hooks/useKeyboardController"
import { useParams, useRouter } from "../../../../../router"
import { ReviewForm } from "./ReviewForm"

export function ReviewDetailScreen() {
  useKeyboardController()
  const {
    params: { id },
  } = useParams<"ReviewDetailScreen">()

  const { goBack } = useRouter()
  const utils = api.useUtils()
  const { data: review, isLoading: reviewLoading } = api.review.detail.useQuery({ id })

  const { mutate, isLoading, error } = api.review.update.useMutation({
    onSuccess: () => {
      if (!review) return
      utils.spot.detail.refetch({ id: review.spotId })
      utils.spot.mapPreview.refetch({ id: review.spotId })
      toast({ title: "Review updated" })
      goBack()
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
            onUpdate={(data) => mutate({ ...data, id })}
          />
        )}
      </ScrollView>
    </ModalView>
  )
}
