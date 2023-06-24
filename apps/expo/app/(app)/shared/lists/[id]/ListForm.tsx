import { FormProvider } from "react-hook-form"

import { type List } from "@ramble/database/types"

import { Button } from "../../../../../components/ui/Button"
import { FormError } from "../../../../../components/ui/FormError"
import { FormInput } from "../../../../../components/ui/FormInput"
import { type RouterInputs } from "../../../../../lib/api"
import { type ApiError, useForm } from "../../../../../lib/hooks/useForm"

type UpdateSubmit = {
  list: Pick<List, "name" | "description">
  onUpdate: (data: Omit<RouterInputs["list"]["update"], "id">) => void
}
type CreateSubmit = {
  list?: undefined
  onCreate: (data: RouterInputs["list"]["create"]) => void
}
interface Props {
  isLoading: boolean
  error?: ApiError
}

export function ListForm(props: Props & (UpdateSubmit | CreateSubmit)) {
  const form = useForm({
    defaultValues: { description: props.list?.description || "", name: props.list?.name || "" },
  })

  return (
    <FormProvider {...form}>
      <FormInput name="name" label="Name" error={props.error} />
      <FormInput name="description" label="Description" multiline error={props.error} />
      <FormError className="mb-1" error={props.error} />
      <Button isLoading={props.isLoading} onPress={form.handleSubmit(props.list ? props.onUpdate : props.onCreate)}>
        Save
      </Button>
    </FormProvider>
  )
}
