import type { Trip } from "@ramble/database/types"
import { useDisclosure } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"
import DateTimePicker from "@react-native-community/datetimepicker"
import dayjs from "dayjs"
import { Image } from "lucide-react-native"
import { FormProvider } from "react-hook-form"
import { Switch, TouchableOpacity, View } from "react-native"
import { Button } from "~/components/ui/Button"
import { FormInput, FormInputLabel } from "~/components/ui/FormInput"
import type { RouterInputs } from "~/lib/api"
import { type ApiError, useForm } from "~/lib/hooks/useForm"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"
import { Icon } from "./Icon"
import { Text } from "./ui/Text"
import { toast } from "./ui/Toast"

type UpdateSubmit = {
  trip: Pick<Trip, "name" | "startDate" | "endDate" | "mediaSyncEnabled">
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
      endDate: props.trip ? dayjs(props.trip.endDate).toDate() : dayjs().add(1, "month").toDate(),
      mediaSyncEnabled: props.trip?.mediaSyncEnabled || false,
    },
  })

  const startDateProps = useDisclosure()
  const endDateProps = useDisclosure()
  const startDate = form.watch("startDate")
  const endDate = form.watch("endDate")
  const mediaSyncEnabled = form.watch("mediaSyncEnabled")

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
        <View>
          <View className="flex flex-row items-center justify-between">
            <FormInputLabel label="From" />
            <TouchableOpacity onPress={startDateProps.onToggle} className="rounded bg-gray-100 px-4 py-1 dark:bg-gray-800">
              <Text className="font-500 text-base">{dayjs(startDate).format("DD MMM YYYY")}</Text>
            </TouchableOpacity>
          </View>
          {startDateProps.isOpen && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="inline"
              onChange={(_, selectedDate) => {
                if (!selectedDate) return
                form.setValue("startDate", dayjs(selectedDate).toDate())
                startDateProps.onClose()
              }}
            />
          )}
        </View>
        <View>
          <View className="flex flex-row items-center justify-between">
            <FormInputLabel label="To" />
            <TouchableOpacity onPress={endDateProps.onToggle} className="rounded bg-gray-100 px-4 py-1 dark:bg-gray-800">
              <Text className="font-500 text-base">{dayjs(endDate).format("DD MMM YYYY")}</Text>
            </TouchableOpacity>
          </View>
          {endDateProps.isOpen && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="inline"
              onChange={(_, selectedDate) => {
                if (!selectedDate) return
                form.setValue("endDate", dayjs(selectedDate).toDate())
                endDateProps.onClose()
              }}
            />
          )}
        </View>
        <View className="flex flex-row items-center justify-between space-x-2">
          <View className="flex flex-row items-center space-x-3">
            <Icon icon={Image} size={24} />
            <View>
              <Text className="h-[22px] text-base">Media sync</Text>
              <Text style={{ lineHeight: 16 }} numberOfLines={3} className="max-w-[220px] text-sm opacity-75">
                Enable automatic media sync for this trip
              </Text>
            </View>
          </View>
          <Switch
            trackColor={{ true: colors.primary[600] }}
            value={mediaSyncEnabled}
            onValueChange={() => form.setValue("mediaSyncEnabled", !mediaSyncEnabled)}
          />
        </View>
        <Button isLoading={props.isLoading} onPress={handleSubmit()}>
          Save
        </Button>
      </View>
    </FormProvider>
  )
}
