import { updateSchema } from "@ramble/api/src/schemas/user"
import { FormProvider } from "react-hook-form"
import { z } from "zod"
import { Button } from "../../../components/Button"
import { FormInput } from "../../../components/FormInput"
import { ScreenView } from "../../../components/ScreenView"
import { api } from "../../../lib/api"
import { useForm } from "../../../lib/hooks/useForm"
import { useMe } from "../../../lib/hooks/useMe"
import { toast } from "../../../components/Toast"
import { ScrollView } from "react-native"
import { FormError } from "../../../components/FormError"

export function AccountScreen() {
  const { me } = useMe()
  const form = useForm({
    schema: updateSchema,
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
      utils.auth.me.setData(undefined, data)
      toast({ title: "Account updated." })
    },
  })

  const onSubmit = (data: z.infer<typeof updateSchema>) => mutate(data)

  return (
    <ScreenView title="Account">
      <FormProvider {...form}>
        <ScrollView contentContainerStyle={{ minHeight: "100%" }} showsVerticalScrollIndicator={false}>
          <FormInput name="firstName" label="First name" error={error} />
          <FormInput name="lastName" label="Last name" error={error} />
          <FormInput autoCapitalize="none" name="email" label="Email" error={error} />
          <FormInput autoCapitalize="none" name="username" label="Username" error={error} />
          <FormInput multiline className="h-[100px]" name="bio" label="Bio" error={error} />
          <Button isLoading={isLoading} onPress={form.handleSubmit(onSubmit)}>
            Save
          </Button>
          <FormError error={error} />
        </ScrollView>
      </FormProvider>
    </ScreenView>
  )
}
