import { useRouter } from "expo-router"
import { usePostHog } from "posthog-react-native"
import { ScrollView } from "react-native"

import { ListForm } from "~/components/ListForm"
import { ModalView } from "~/components/ui/ModalView"
import { type RouterInputs, api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"

export default function NewListScreen() {
  const router = useRouter()
  const { me } = useMe()
  const utils = api.useUtils()
  const posthog = usePostHog()
  const {
    mutate,
    error,
    isPending: isLoading,
  } = api.list.create.useMutation({
    onSuccess: (data) => {
      if (!me) return
      posthog.capture("list created", { name: data.name })
      utils.list.allByUser.refetch({ username: me.username })
      router.back()
    },
  })

  const handleSubmit = (data: RouterInputs["list"]["create"]) => mutate(data)

  return (
    <ModalView title="new list">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <ListForm onCreate={handleSubmit} isLoading={isLoading} error={error} />
      </ScrollView>
    </ModalView>
  )
}
