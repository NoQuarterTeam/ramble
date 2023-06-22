import { ScrollView } from "react-native"

import { ModalView } from "../../../../../../components/ModalView"
import { Text } from "../../../../../../components/Text"
import { api } from "../../../../../../lib/api"
import { useParams, useRouter } from "../../../../../router"
import { ReviewForm } from "./ReviewForm"
import { toast } from "../../../../../../components/Toast"

export function NewReviewScreen() {
  const {
    params: { spotId },
  } = useParams<"NewReviewScreen">()

  const { goBack } = useRouter()
  const utils = api.useContext()
  const { mutate, isLoading, error } = api.review.create.useMutation({
    onSuccess: () => {
      utils.spot.detail.refetch({ id: spotId })
      utils.spot.mapPreview.refetch({ id: spotId })
      goBack()
    },
    onError: ({ message }) => {
      toast({ title: "Something went wrong", message, type: "error" })
    },
  })
  const { data: spot } = api.spot.detail.useQuery({ id: spotId })

  return (
    <ModalView title={`New review for ${spot?.name}`}>
      <ScrollView contentContainerStyle={{ minHeight: "100%" }} showsVerticalScrollIndicator={false}>
        <Text className="mt-4 text-xl">Be nice, be honest</Text>
        <ReviewForm isLoading={isLoading} error={error} onSubmit={mutate} spotId={spotId} />
      </ScrollView>
    </ModalView>
  )
}
