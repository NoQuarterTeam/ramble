import { useLocalSearchParams, useRouter } from "expo-router"
import { Alert, ScrollView, View } from "react-native"
import { TripForm } from "~/components/TripForm"
import { DeleteButton } from "~/components/ui/DeleteButton"
import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"
import { useMe } from "~/lib/hooks/useMe"

export default function EditTrip() {
  const { id } = useLocalSearchParams<{ id: string }>()
  useKeyboardController()
  const { me } = useMe()
  const utils = api.useUtils()
  const router = useRouter()
  const { data, isLoading: tripLoading } = api.trip.info.useQuery({ id })

  const { mutate, isLoading, error } = api.trip.update.useMutation({
    onSuccess: async (data) => {
      utils.trip.info.refetch({ id })
      utils.trip.detail.setData({ id }, (prev) => (prev ? { ...prev, trip: { ...prev.trip, ...data } } : prev))
      void utils.trip.active.refetch()
      void utils.trip.upcoming.refetch()
      void utils.trip.complete.refetch()
      router.back()
    },
  })

  const { mutate: deleteTrip, isLoading: deleteLoading } = api.trip.delete.useMutation({
    onSuccess: async () => {
      void utils.trip.mine.refetch()
      void utils.trip.active.refetch()
      void utils.trip.upcoming.refetch()
      void utils.trip.complete.refetch()
      router.navigate("/(home)/(trips)/trips")
    },
  })
  const handleDelete = () => {
    Alert.alert(
      "Are you sure?",
      "This action cannot be undone",
      [
        { text: "Confirm", style: "destructive", onPress: () => deleteTrip({ id }) },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    )
  }

  return (
    <ModalView title="edit trip">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        className="flex-1"
      >
        {tripLoading ? null : !data ? (
          <Text>List not found</Text>
        ) : (
          <TripForm trip={data} isLoading={isLoading} error={error} onUpdate={(data) => mutate({ ...data, id })} />
        )}
        {data?.creatorId === me?.id && (
          <View className="flex items-center justify-center py-4">
            <DeleteButton isLoading={deleteLoading} onPress={handleDelete} />
          </View>
        )}
      </ScrollView>
    </ModalView>
  )
}
