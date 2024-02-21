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
import { toast } from "./ui/Toast"
import { isAndroid } from "~/lib/device"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"

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
  useKeyboardController()
  const form = useForm({
    defaultValues: {
      name: props.trip?.name || "",
      startDate: props.trip ? dayjs(props.trip.startDate).toDate() : new Date(),
      endDate: props.trip ? dayjs(props.trip.endDate).toDate() : new Date(),
    },
  })

  const startDate = form.watch("startDate")
  const endDate = form.watch("endDate")

  const handleSubmit = () => {
    return form.handleSubmit((data) => {
      if (dayjs(data.startDate).isAfter(data.endDate)) {
        return toast({ type: "error", title: "Start date must be before end date" })
      }
      if (props.trip) props.onUpdate(data)
      else props.onCreate(data)
    })
  }

  return (
    <FormProvider {...form}>
      <View className="space-y-2">
        <FormInput name="name" label="Name" error={props.error} />
        <View className="flex flex-row items-center justify-between">
          <FormInputLabel label="From" />
          {isAndroid ? (
            <View></View>
          ) : (
            <DateTimePicker
              value={startDate}
              mode="date"
              // style={{ width: 130 }}
              display="compact"
              onChange={(_, selectedDate) => {
                if (!selectedDate) return
                form.setValue("startDate", dayjs(selectedDate).toDate())
              }}
            />
          )}
        </View>
        <View className="flex flex-row items-center justify-between">
          <FormInputLabel label="To" />
          {isAndroid ? (
            <View></View>
          ) : (
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
          )}
        </View>
        <Button isLoading={props.isLoading} onPress={handleSubmit()}>
          Save
        </Button>
        <FormError error={props.error} />
      </View>
    </FormProvider>
  )
}
