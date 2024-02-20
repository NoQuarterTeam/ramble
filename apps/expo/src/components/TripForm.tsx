import { FormProvider } from "react-hook-form"
import DateTimePicker from "@react-native-community/datetimepicker"
import { type Trip } from "@ramble/database/types"

import { Button } from "~/components/ui/Button"
import { FormError } from "~/components/ui/FormError"
import { FormInput, FormInputLabel } from "~/components/ui/FormInput"
import { type RouterInputs } from "~/lib/api"
import { type ApiError, useForm } from "~/lib/hooks/useForm"
import dayjs from "dayjs"
import { View } from "react-native"

type UpdateSubmit = {
  trip: Pick<Trip, "name" | "startDate" | "endDate">
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
      startDate: props.trip ? dayjs(props.trip.startDate).toDate() : new Date(),
      endDate: props.trip ? dayjs(props.trip.endDate).toDate() : new Date(),
    },
  })

  const startDate = form.watch("startDate")
  const endDate = form.watch("endDate")

  return (
    <FormProvider {...form}>
      <View className="space-y-2">
        <FormInput name="name" label="Name" error={props.error} />
        <View className="flex flex-row items-center justify-between">
          <FormInputLabel label="From" />
          <DateTimePicker
            value={startDate}
            mode="date"
            // style={{ width: 330 }}
            display="compact"
            onChange={(_, selectedDate) => {
              if (!selectedDate) return
              form.setValue("startDate", dayjs(selectedDate).toDate())
            }}
          />
        </View>
        <View className="flex flex-row items-center justify-between">
          <FormInputLabel label="To" />
          <DateTimePicker
            value={endDate}
            mode="date"
            // style={{ width: 130 }}
            display="compact"
            onChange={(_, selectedDate) => {
              if (!selectedDate) return
              form.setValue("endDate", dayjs(selectedDate).toDate())
            }}
          />
        </View>
        <FormError className="mb-1" error={props.error} />
        <Button isLoading={props.isLoading} onPress={form.handleSubmit(props.trip ? props.onUpdate : props.onCreate)}>
          Save
        </Button>
      </View>
    </FormProvider>
  )
}
