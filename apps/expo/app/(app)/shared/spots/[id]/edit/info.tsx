import * as React from "react"
import { ScrollView, Switch, View } from "react-native"
import { Dog } from "lucide-react-native"

import colors from "@ramble/tailwind-config/src/colors"

import { Button } from "../../../../../../components/ui/Button"
import { FormInputLabel } from "../../../../../../components/ui/FormInput"
import { Input } from "../../../../../../components/ui/Input"
import { Text } from "../../../../../../components/ui/Text"
import { useKeyboardController } from "../../../../../../lib/hooks/useKeyboardController"
import { useParams, useRouter } from "../../../../../router"
import { EditSpotModalView } from "./EditSpotModalView"
import { doesSpotTypeRequireAmenities } from "@ramble/shared"

export function EditSpotOptionsScreen() {
  useKeyboardController()
  const { params } = useParams<"EditSpotOptionsScreen">()
  const [name, setName] = React.useState<string>(params.name)
  const [description, setDescription] = React.useState(params.description)
  const [isPetFriendly, setIsPetFriendly] = React.useState(params.isPetFriendly)
  const router = useRouter()
  return (
    <EditSpotModalView title="Some info">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <FormInputLabel label="Name" />
        <Input value={name} onChangeText={setName} />
        <View className="flex w-full flex-row items-center justify-between py-4">
          <View className="flex flex-row items-center space-x-2">
            <Dog size={20} className="text-black dark:text-white" />
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
            onPress={() =>
              router.push(doesSpotTypeRequireAmenities(params.type) ? "EditSpotAmenitiesScreen" : "EditSpotImagesScreen", {
                ...params,
                name,
                description,
                isPetFriendly,
              })
            }
          >
            Next
          </Button>
        </View>
      )}
    </EditSpotModalView>
  )
}
