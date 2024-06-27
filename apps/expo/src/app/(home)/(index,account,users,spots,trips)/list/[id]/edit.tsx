import { useLocalSearchParams, useRouter } from "expo-router"
import { ScrollView, View } from "react-native"

import { ListForm } from "~/components/ListForm"
import { DeleteButton } from "~/components/ui/DeleteButton"
import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

export default function EditListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data, isLoading: listLoading } = api.list.detail.useQuery({ id })
  const list = data?.list
  const router = useRouter()
  const { me } = useMe()
  const utils = api.useUtils()
  const {
    mutate,
    error,
    isPending: isLoading,
  } = api.list.update.useMutation({
    onSuccess: () => {
      if (!me) return
      utils.list.detail.refetch({ id })
      utils.list.allByUser.refetch({ username: me.username })
      router.back()
    },
  })

  const tab = useTabSegment()
  const { mutate: deleteList, isPending: deleteLoading } = api.list.delete.useMutation({
    onSuccess: () => {
      if (!me) return
      utils.list.allByUser.refetch({ username: me.username })
      router.navigate(`/${tab}/lists`)
    },
  })

  return (
    <ModalView title="edit list">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {listLoading ? null : !list ? (
          <Text>List not found</Text>
        ) : (
          <ListForm list={list} isLoading={isLoading} error={error} onUpdate={(data) => mutate({ ...data, id })} />
        )}
      </ScrollView>
      <View className="absolute right-0 bottom-10 left-0 flex items-center justify-center">
        <DeleteButton isLoading={deleteLoading} onPress={() => deleteList({ id })} />
      </View>
    </ModalView>
  )
}
