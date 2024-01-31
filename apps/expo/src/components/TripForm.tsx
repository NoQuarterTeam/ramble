import { FormProvider } from "react-hook-form"

import { type Trip } from "@ramble/database/types"

import { Button } from "~/components/ui/Button"
import { FormError } from "~/components/ui/FormError"
import { FormInput, FormSwitchInput } from "~/components/ui/FormInput"
import { type RouterInputs } from "~/lib/api"
import { type ApiError, useForm } from "~/lib/hooks/useForm"

type UpdateSubmit = {
  trip: Pick<Trip, "name">
  onUpdate: (data: Omit<RouterInputs["trip"]["update"], "id">) => void
}
type CreateSubmit = {
  trip?: undefined
  onCreate: (data: RouterInputs["trip"]["create"]) => void
}
interface Props {
  isLoading: boolean
  error?: ApiError
}

export function TripForm(props: Props & (UpdateSubmit | CreateSubmit)) {
  const form = useForm({
    defaultValues: {
      name: props.trip?.name || "",
    },
  })

  return (
    <FormProvider {...form}>
      <FormInput name="name" label="Name" error={props.error} />
      <FormError className="mb-1" error={props.error} />
      <Button isLoading={props.isLoading} onPress={form.handleSubmit(props.trip ? props.onUpdate : props.onCreate)}>
        Save
      </Button>
    </FormProvider>
  )
}
