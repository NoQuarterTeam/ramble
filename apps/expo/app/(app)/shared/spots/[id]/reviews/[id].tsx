import { ScrollView, View } from "react-native"
import { type z } from "zod"

import { type reviewSchema } from "@ramble/api/src/schemas/review"

import { Button } from "../../../../../../components/Button"
import { ModalView } from "../../../../../../components/ModalView"
import { Text } from "../../../../../../components/Text"
import { toast } from "../../../../../../components/Toast"
import { api } from "../../../../../../lib/api"
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
      <ScrollView contentContainerStyle={{ minHeight: "100%" }}>
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
      </ScrollView>
    </ModalView>
  )
}
