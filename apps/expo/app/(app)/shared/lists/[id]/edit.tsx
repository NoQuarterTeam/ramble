import { ScrollView, View } from "react-native"

import { DeleteButton } from "../../../../../components/ui/DeleteButton"
import { ModalView } from "../../../../../components/ui/ModalView"
import { Text } from "../../../../../components/ui/Text"
import { api } from "../../../../../lib/api"
import { useMe } from "../../../../../lib/hooks/useMe"
import { useParams, useRouter } from "../../../../router"
import { ListForm } from "./ListForm"

export function EditListScreen() {
  const {
    params: { id },
  } = useParams<"EditListScreen">()
  const { data, isLoading: listLoading } = api.list.detail.useQuery({ id })
  const list = data?.list
  const { goBack, navigate } = useRouter()
  const { me } = useMe()
  const utils = api.useUtils()
  const { mutate, error, isLoading } = api.list.update.useMutation({
    onSuccess: () => {
      if (!me) return
      utils.list.detail.refetch({ id })
      utils.list.allByUser.refetch({ username: me.username })
      goBack()
    },
  })

  const { mutate: deleteList, isLoading: deleteLoading } = api.list.delete.useMutation({
    onSuccess: () => {
      if (!me) return
      utils.list.allByUser.refetch({ username: me.username })
      navigate("ListsScreen")
    },
  })

  return (
    <ModalView title="edit list">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {listLoading ? null : !list ? (
          <Text>List not found</Text>
        ) : (
          <ListForm list={list} isLoading={isLoading} error={error} onUpdate={(data) => mutate({ ...data, id })} />
        )}
      </ScrollView>
      <View className="absolute bottom-10 left-0 right-0 flex items-center justify-center">
        <DeleteButton isLoading={deleteLoading} onPress={() => deleteList({ id })} />
      </View>
    </ModalView>
  )
}
