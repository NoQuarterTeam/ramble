import { FormProvider } from "react-hook-form"
import { ModalView } from "../../../components/ModalView"

import { useForm } from "../../../lib/hooks/useForm"
import { FormInput } from "../../../components/FormInput"
import { ScrollView } from "react-native"
import { FormError } from "../../../components/FormError"
import { Button } from "../../../components/Button"
import { api } from "../../../lib/api"
import { useRouter } from "../../router"
import { useMe } from "../../../lib/hooks/useMe"

export function NewListScreen() {
  const { goBack } = useRouter()
  const { me } = useMe()
  const utils = api.useContext()
  const { mutate, error, isLoading } = api.list.create.useMutation({
    onSuccess: () => {
      if (!me) return
      utils.user.lists.refetch({ username: me.username })
      goBack()
    },
  })

  const form = useForm({ defaultValues: { name: "", description: "" } })
  const handleSubmit = form.handleSubmit((data) => mutate(data))

  return (
    <ModalView title="New list">
      <FormProvider {...form}>
        <ScrollView contentContainerStyle={{ minHeight: "100%" }} showsVerticalScrollIndicator={false}>
          <FormInput name="name" label="Name" error={error} />
          <FormInput name="description" label="Description" multiline error={error} />
          <FormError error={error} />
          <Button isLoading={isLoading} onPress={handleSubmit}>
            Save
          </Button>
        </ScrollView>
      </FormProvider>
    </ModalView>
  )
}
