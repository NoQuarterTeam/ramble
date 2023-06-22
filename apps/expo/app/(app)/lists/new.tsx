import { ScrollView } from "react-native"

import { ModalView } from "../../../components/ModalView"
import { api, type RouterInputs } from "../../../lib/api"
import { useMe } from "../../../lib/hooks/useMe"
import { useRouter } from "../../router"
import { ListForm } from "../shared/lists/[id]/ListForm"

export function NewListScreen() {
  const { goBack } = useRouter()
  const { me } = useMe()
  const utils = api.useContext()
  const { mutate, error, isLoading } = api.list.create.useMutation({
    onSuccess: () => {
      if (!me) return
      utils.list.allByUser.refetch({ username: me.username })
      goBack()
    },
  })

  const handleSubmit = (data: RouterInputs["list"]["create"]) => mutate(data)

  return (
    <ModalView title="New list">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <ListForm onCreate={handleSubmit} isLoading={isLoading} error={error} />
      </ScrollView>
    </ModalView>
  )
}
