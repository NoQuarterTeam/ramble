import * as React from "react"
import { ScreenView } from "../../../components/ui/ScreenView"
import colors from "@ramble/tailwind-config/src/colors"
import { ScrollView, Switch, View } from "react-native"
import { Button } from "../../../components/ui/Button"
import { useParams, useRouter } from "../../router"
import { Input } from "../../../components/ui/Input"
import { useKeyboardController } from "../../../lib/hooks/useKeyboardController"
import { FormInputLabel } from "../../../components/ui/FormInput"
import { Dog, X } from "lucide-react-native"
import { Text } from "../../../components/ui/Text"

export function NewSpotOptionsScreen() {
  useKeyboardController()
  const { params } = useParams<"NewSpotOptionsScreen">()
  const [name, setName] = React.useState<string>()
  const [description, setDescription] = React.useState<string>()
  const [isPetFriendly, setIsPetFriendly] = React.useState(false)
  const router = useRouter()
  return (
    <ScreenView
      title="Some info"
      rightElement={
        description &&
        name && (
          <Button
            size="sm"
            variant="link"
            onPress={() =>
              router.push(params.type === "CAMPING" ? "NewSpotAmenitiesScreen" : "NewSpotImagesScreen", {
                ...params,
                info: { name, description, isPetFriendly },
              })
            }
          >
            Next
          </Button>
        )
      }
    >
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
        <Input value={description} onChangeText={setDescription} multiline numberOfLines={4} />
      </ScrollView>
      <View className="absolute bottom-4 left-4 flex flex-row right-4 items-center justify-center">
        <Button
          variant="secondary"
          leftIcon={<X size={20} className="text-black dark:text-white" />}
          className="rounded-full"
          size="sm"
          onPress={router.popToTop}
        >
          Cancel
        </Button>
      </View>
    </ScreenView>
  )
}
