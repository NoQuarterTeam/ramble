import { FormProvider } from "react-hook-form"
import { ScrollView } from "react-native"

import { Button } from "../../../components/ui/Button"
import { FormError } from "../../../components/ui/FormError"
import { FormInput } from "../../../components/ui/FormInput"
import { ScreenView } from "../../../components/ui/ScreenView"
import { toast } from "../../../components/ui/Toast"
import { api } from "../../../lib/api"
import { useForm } from "../../../lib/hooks/useForm"
import { useMe } from "../../../lib/hooks/useMe"

export function AccountScreen() {
  const { me } = useMe()
  const form = useForm({
    defaultValues: {
      bio: me?.bio || "",
      firstName: me?.firstName || "",
      lastName: me?.lastName || "",
      email: me?.email || "",
      username: me?.username || "",
    },
  })

  const utils = api.useContext()
  const { mutate, isLoading, error } = api.user.update.useMutation({
    onSuccess: (data) => {
      utils.user.me.setData(undefined, data)
      toast({ title: "Account updated." })
    },
  })

  const onSubmit = form.handleSubmit((data) => mutate(data))

  return (
    <ScreenView title="Account">
      <FormProvider {...form}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <FormInput name="firstName" label="First name" error={error} />
          <FormInput name="lastName" label="Last name" error={error} />
          <FormInput autoCapitalize="none" name="email" label="Email" error={error} />
          <FormInput autoCapitalize="none" name="username" label="Username" error={error} />
          <FormInput multiline className="h-[100px]" name="bio" label="Bio" error={error} />
          <Button isLoading={isLoading} onPress={onSubmit}>
            Save
          </Button>
          <FormError error={error} />
        </ScrollView>
      </FormProvider>
    </ScreenView>
  )
}
