import * as React from "react"
import { ScrollView, Switch, View } from "react-native"
import { Dog } from "lucide-react-native"

import { doesSpotTypeRequireAmenities } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "../../../../../components/Icon"
import { Button } from "../../../../../components/ui/Button"
import { FormInputLabel } from "../../../../../components/ui/FormInput"
import { Input } from "../../../../../components/ui/Input"
import { Text } from "../../../../../components/ui/Text"
import { useKeyboardController } from "../../../../../lib/hooks/useKeyboardController"
import { useParams, useRouter } from "../../../../router"
import { NewSpotModalView } from "./NewSpotModalView"

export function NewSpotOptionsScreen() {
  useKeyboardController()
  const { params } = useParams<"NewSpotOptionsScreen">()
  const [name, setName] = React.useState<string>()
  const [description, setDescription] = React.useState<string>()
  const [isPetFriendly, setIsPetFriendly] = React.useState(false)
  const router = useRouter()
  return (
    <NewSpotModalView title="some info">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <FormInputLabel label="Name" name="name" />
        <Input nativeID="name" value={name} onChangeText={setName} />
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
        <FormInputLabel label="Describe the spot" name="description" />
        <Input nativeID="description" value={description} onChangeText={setDescription} multiline numberOfLines={4} />
      </ScrollView>
      {description && name && (
        <View className="absolute bottom-12 left-4 right-4 flex items-center justify-center space-y-2">
          <Button
            className="rounded-full"
            onPress={() =>
              router.push(doesSpotTypeRequireAmenities(params.type) ? "NewSpotAmenitiesScreen" : "NewSpotImagesScreen", {
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
    </NewSpotModalView>
  )
}
