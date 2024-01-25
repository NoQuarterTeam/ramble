import { ScrollView } from "react-native"
import { useRouter } from "expo-router"

import { ListForm } from "~/components/ListForm"
import { ModalView } from "~/components/ui/ModalView"
import { api, type RouterInputs } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"

export default function NewListScreen() {
  const router = useRouter()
  const { me } = useMe()
  const utils = api.useUtils()
  const { mutate, error, isLoading } = api.list.create.useMutation({
    onSuccess: () => {
      if (!me) return
      utils.list.allByUser.refetch({ username: me.username })
      router.back()
    },
  })

  const handleSubmit = (data: RouterInputs["list"]["create"]) => mutate(data)

  return (
    <ModalView title="new list">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <ListForm onCreate={handleSubmit} isLoading={isLoading} error={error} />
      </ScrollView>
    </ModalView>
  )
}
