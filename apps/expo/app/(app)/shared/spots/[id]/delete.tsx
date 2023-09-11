import { View } from "react-native"

import { Button } from "../../../../../components/ui/Button"
import { ModalView } from "../../../../../components/ui/ModalView"
import { Text } from "../../../../../components/ui/Text"
import { toast } from "../../../../../components/ui/Toast"
import { api } from "../../../../../lib/api"
import { useParams, useRouter } from "../../../../router"

export function DeleteSpotScreen() {
  const {
    params: { id },
  } = useParams<"DeleteSpotScreen">()

  const router = useRouter()

  const utils = api.useContext()
  const { mutate, isLoading } = api.spot.delete.useMutation({
    onSuccess: async () => {
      await utils.spot.list.refetch({ skip: 0, sort: "latest" })
      router.goBack()
      router.popToTop()
      toast({ title: "Spot deleted" })
    },
  })

  return (
    <ModalView title="Delete spot">
      <View className="space-y-4">
        <Text className="text-lg">Are you sure? This can't be undone</Text>
        <View className="space-y-2">
          <Button isLoading={isLoading} variant="destructive" onPress={() => mutate({ id })}>
            Delete
          </Button>
          <Button variant="secondary" onPress={() => router.goBack()}>
            Cancel
          </Button>
        </View>
      </View>
    </ModalView>
  )
}
