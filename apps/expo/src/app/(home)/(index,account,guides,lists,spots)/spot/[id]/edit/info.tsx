import * as React from "react"
import { ScrollView, Switch, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Dog } from "lucide-react-native"

import { type SpotType } from "@ramble/database/types"
import { doesSpotTypeRequireAmenities } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { FormInputLabel } from "~/components/ui/FormInput"
import { Input } from "~/components/ui/Input"
import { Text } from "~/components/ui/Text"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { EditSpotModalView } from "./EditSpotModalView"

export default function EditSpotOptionsScreen() {
  useKeyboardController()
  const { id, ...params } = useLocalSearchParams<{
    id: string
    type: SpotType
    name: string
    description: string
    isPetFriendly: string
  }>()
  const [name, setName] = React.useState<string>(params.name)
  const [description, setDescription] = React.useState(params.description)
  const [isPetFriendly, setIsPetFriendly] = React.useState(params.isPetFriendly === "true")
  const router = useRouter()
  const tab = useTabSegment()
  return (
    <EditSpotModalView title="some info">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <FormInputLabel label="Name" />
        <Input value={name} onChangeText={setName} />
        <View className="flex w-full flex-row items-center justify-between py-4">
          <View className="flex flex-row items-center space-x-2">
            <Icon icon={Dog} size={20} />
            <Text className="text-xl">Pet friendly</Text>
          </View>
          <Switch
            trackColor={{ true: colors.primary[600] }}
            value={isPetFriendly}
            onValueChange={() => setIsPetFriendly((p) => !p)}
          />
        </View>
        <FormInputLabel label="Describe the spot" />
        <Input value={description || ""} onChangeText={setDescription} multiline numberOfLines={4} />
      </ScrollView>
      {(doesSpotTypeRequireAmenities(params.type) ? !!description && !!name : !!name) && (
        <View className="absolute bottom-12 left-4 right-4 flex items-center justify-center space-y-2">
          <Button
            className="rounded-full"
            onPress={() => {
              const searchParams = new URLSearchParams({
                ...params,
                name,
                description,
                isPetFriendly: isPetFriendly.toString(),
              })

              router.push(
                doesSpotTypeRequireAmenities(params.type)
                  ? `/${tab}/spot/${id}/edit/amenities?${searchParams}`
                  : `/${tab}/spot/${id}/edit/images?${searchParams}`,
              )
            }}
          >
            Next
          </Button>
        </View>
      )}
    </EditSpotModalView>
  )
}
