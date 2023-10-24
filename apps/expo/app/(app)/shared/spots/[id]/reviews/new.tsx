import { ScrollView } from "react-native"

import { ModalView } from "../../../../../../components/ui/ModalView"
import { Text } from "../../../../../../components/ui/Text"
import { api } from "../../../../../../lib/api"
import { useKeyboardController } from "../../../../../../lib/hooks/useKeyboardController"
import { useParams, useRouter } from "../../../../../router"
import { ReviewForm } from "./ReviewForm"

export function NewReviewScreen() {
  useKeyboardController()
  const {
    params: { spotId },
  } = useParams<"NewReviewScreen">()

  const { goBack } = useRouter()
  const utils = api.useUtils()
  const { mutate, isLoading, error } = api.review.create.useMutation({
    onSuccess: () => {
      utils.spot.detail.refetch({ id: spotId })
      utils.spot.mapPreview.refetch({ id: spotId })
      goBack()
    },
  })
  const { data: spot } = api.spot.detail.useQuery({ id: spotId })
  return (
    <ModalView title="new review">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Text className="pb-4">{spot?.name}</Text>
        <ReviewForm isLoading={isLoading} error={error} onCreate={mutate} spotId={spotId} />
      </ScrollView>
    </ModalView>
  )
}
