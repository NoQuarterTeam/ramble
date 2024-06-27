import { useDisclosure } from "@ramble/shared"
import DateTimePicker from "@react-native-community/datetimepicker"
import dayjs from "dayjs"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as React from "react"
import { TouchableOpacity } from "react-native"
import { View } from "react-native"
import { ScrollView } from "react-native"
import { Button } from "~/components/ui/Button"
import { FormInputLabel } from "~/components/ui/FormInput"
import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"

export default function EditTripItem() {
  const { itemId, date: initialDate, id } = useLocalSearchParams<{ id: string; itemId: string; date: string }>()
  const [date, setDate] = React.useState(initialDate ? dayjs(initialDate).toDate() : new Date())

  const dateProps = useDisclosure()

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
        <View>
          <View className="flex flex-row items-center justify-between">
            <FormInputLabel label="Date" />
            <TouchableOpacity onPress={dateProps.onToggle} className="rounded bg-gray-100 px-4 py-1 dark:bg-gray-800">
              <Text className="font-500 text-base">{dayjs(date).format("DD MMM YYYY")}</Text>
            </TouchableOpacity>
          </View>
          {dateProps.isOpen && (
            <DateTimePicker
              value={date}
              mode="date"
              display="inline"
              onChange={(_, selectedDate) => {
                if (!selectedDate) return
                setDate(dayjs(selectedDate).toDate())
                dateProps.onClose()
              }}
            />
          )}
        </View>
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
