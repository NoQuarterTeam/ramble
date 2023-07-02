import { ScrollView } from "react-native"

import { ModalView } from "../../../../../../components/ui/ModalView"
import { api } from "../../../../../../lib/api"
import { useParams, useRouter } from "../../../../../router"
import { ReviewForm } from "./ReviewForm"
import { useKeyboardController } from "../../../../../../lib/hooks/useKeyboardController"

export function NewReviewScreen() {
  useKeyboardController()
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
  })
  const { data: spot } = api.spot.detail.useQuery({ id: spotId })
  return (
    <ModalView title={`New review for ${spot?.name}`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <ReviewForm isLoading={isLoading} error={error} onCreate={mutate} spotId={spotId} />
      </ScrollView>
    </ModalView>
  )
}
