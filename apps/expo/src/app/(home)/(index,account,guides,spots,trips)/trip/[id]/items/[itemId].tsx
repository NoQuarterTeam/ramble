import DateTimePicker from "@react-native-community/datetimepicker"
import dayjs from "dayjs"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as React from "react"
import { ScrollView } from "react-native"
import { Button } from "~/components/ui/Button"
import { ModalView } from "~/components/ui/ModalView"
import { api } from "~/lib/api"

export default function EditTripItem() {
  const { itemId, date: initialDate, id } = useLocalSearchParams<{ id: string; itemId: string; date: string }>()
  const [date, setDate] = React.useState(initialDate ? dayjs(initialDate).toDate() : new Date())

  const router = useRouter()
  const utils = api.useUtils()
  const { mutate, isPending: isLoading } = api.trip.items.update.useMutation({
    onSuccess: async () => {
      await utils.trip.detail.refetch({ id })
      router.back()
    },
  })

  return (
    <ModalView title="set date">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <DateTimePicker
          value={date}
          mode="date"
          display="inline"
          onChange={(_, selectedDate) => {
            if (!selectedDate) return
            setDate(selectedDate)
          }}
        />
        <Button isLoading={isLoading} onPress={() => mutate({ id: itemId, date })}>
          Save
        </Button>
        {initialDate && (
          <Button variant="ghost" isLoading={isLoading} onPress={() => mutate({ id: itemId, date: null })}>
            Remove date
          </Button>
        )}
      </ScrollView>
    </ModalView>
  )
}
