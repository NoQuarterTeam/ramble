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

export function AccountScreen() {
  const { me } = useMe()
  const form = useForm({
    schema: updateSchema,
    defaultValues: { bio: me?.bio || "", firstName: me?.firstName || "", lastName: me?.lastName || "", email: me?.email || "" },
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
        <FormInput name="firstName" label="First name" error={error?.data?.zodError?.fieldErrors.firstName} />
        <FormInput name="lastName" label="Last name" error={error?.data?.zodError?.fieldErrors.lastName} />
        <FormInput name="email" label="Email" error={error?.data?.zodError?.fieldErrors.email} />
        <FormInput multiline className="h-[100px]" name="bio" label="Bio" error={error?.data?.zodError?.fieldErrors.bio} />
        <Button isLoading={isLoading} onPress={form.handleSubmit(onSubmit)}>
          Save
        </Button>
      </FormProvider>
    </ScreenView>
  )
}
