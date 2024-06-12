import { useLocalSearchParams, useRouter } from "expo-router"
import { ScrollView } from "react-native"
import { ReviewForm } from "~/components/ReviewForm"

import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"
import { useMe } from "~/lib/hooks/useMe"

export default function NewReviewScreen() {
  useKeyboardController()
  const { id, tripId, shouldRedirect } = useLocalSearchParams<{ id: string; tripId: string; shouldRedirect?: "true" | "false" }>()

  const { me } = useMe()
  const router = useRouter()
  const utils = api.useUtils()
  const {
    mutate,
    isPending: isLoading,
    error,
  } = api.review.create.useMutation({
    onSuccess: () => {
      utils.spot.detail.refetch({ id })
      utils.spot.mapPreview.refetch({ id })
      onRedirect()
    },
  })
  const { data } = api.spot.detail.useQuery({ id })
  const spot = data?.spot

  const onRedirect = async () => {
    if (shouldRedirect === "true") {
      if (tripId) {
        await utils.trip.detail.refetch({ id: tripId })
        router.navigate(`/(home)/(trips)/trip/${tripId}`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        toast({ title: "Spot created", message: "Thank you for contributing to the community!" })
      } else {
        if (me?.role === "GUIDE") {
          void utils.spot.list.refetch({ skip: 0, sort: "latest" })
          router.navigate(`/(home)/(index)/spot/${id}`)
          await new Promise((resolve) => setTimeout(resolve, 1000))
          toast({ title: "Spot created", message: "Thank you for contributing to the community!" })
        } else {
          router.navigate("/")
          await new Promise((resolve) => setTimeout(resolve, 1000))
          toast({ title: "A guide will review your spot", message: "Thank you for contributing to the community!" })
        }
      }
    } else {
      router.back()
    }
  }

  return (
    <ModalView title="add a review" onBack={onRedirect}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-lg">{spot?.name}</Text>
        {spot && <ReviewForm isLoading={isLoading} error={error} onCreate={mutate} spotId={id} spotType={spot.type} />}
      </ScrollView>
    </ModalView>
  )
}
