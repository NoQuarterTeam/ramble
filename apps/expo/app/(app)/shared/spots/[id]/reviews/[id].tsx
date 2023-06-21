import { ModalView } from "../../../../../../components/ModalView"
import { api } from "../../../../../../lib/api"

import { reviewSchema } from "@ramble/api/src/schemas/review"
import { Text } from "../../../../../../components/Text"
import { useParams, useRouter } from "../../../../../router"

import { z } from "zod"
import { ReviewForm } from "./ReviewForm"
import { View } from "react-native"
import { Button } from "../../../../../../components/Button"
import { toast } from "../../../../../../components/Toast"

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
  const { mutate: deleteReview, isLoading: deleteLoading } = api.review.delete.useMutation({
    onSuccess: () => {
      if (!review) return
      utils.spot.detail.refetch({ id: review.spotId })
      utils.spot.mapPreview.refetch({ id: review.spotId })
      goBack()
    },
  })
  const handleSubmit = (data: z.infer<typeof reviewSchema>) => mutate({ ...data, id })

  return (
    <ModalView title={`Edit review for ${review?.spot?.name}`}>
      {reviewLoading ? null : !review ? (
        <Text>Review not found</Text>
      ) : (
        <View>
          <ReviewForm review={review} spotId={review?.spotId} isLoading={isLoading} error={error} onSubmit={handleSubmit} />
          <Button className="mt-2" isLoading={deleteLoading} variant="destructive" onPress={() => deleteReview({ id })}>
            Delete
          </Button>
        </View>
      )}
    </ModalView>
  )
}
