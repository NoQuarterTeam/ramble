import { useLocalSearchParams, useRouter } from "expo-router"
import { View } from "react-native"

import { Button } from "~/components/ui/Button"
import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"

export default function DeleteSpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const router = useRouter()

  const utils = api.useUtils()
  const { mutate, isPending: isLoading } = api.spot.delete.useMutation({
    onSuccess: async () => {
      await utils.spot.list.refetch({ skip: 0, sort: "latest" })
      router.navigate("/")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({ title: "Spot deleted" })
    },
  })

  return (
    <ModalView title="delete spot">
      <View className="space-y-4">
        <Text className="text-lg">Are you sure? This can't be undone</Text>
        <View className="space-y-2">
          <Button isLoading={isLoading} variant="destructive" onPress={() => mutate({ id })}>
            Delete
          </Button>
          <Button variant="secondary" onPress={() => router.back()}>
            Cancel
          </Button>
        </View>
      </View>
    </ModalView>
  )
}
