import { ScrollView } from "react-native"

import { ModalView } from "../../../../../../components/ModalView"
import { Text } from "../../../../../../components/Text"
import { toast } from "../../../../../../components/Toast"
import { RouterInputs, api } from "../../../../../../lib/api"
import { useParams, useRouter } from "../../../../../router"
import { ReviewForm } from "./ReviewForm"

export function ReviewDetailScreen() {
  const {
    params: { id },
  } = useParams<"ReviewDetailScreen">()

  const { goBack } = useRouter()
  const utils = api.useContext()
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

  const handleSubmit = (data: Omit<RouterInputs["review"]["update"], "id">) => mutate({ ...data, id })

  return (
    <ModalView title={`Edit review for ${review?.spot?.name}`}>
      <ScrollView contentContainerStyle={{ minHeight: "100%" }} showsVerticalScrollIndicator={false}>
        {reviewLoading ? null : !review ? (
          <Text>Review not found</Text>
        ) : (
          <ReviewForm review={review} spotId={review?.spotId} isLoading={isLoading} error={error} onSubmit={handleSubmit} />
        )}
      </ScrollView>
    </ModalView>
  )
}
