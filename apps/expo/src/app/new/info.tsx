import { useLocalSearchParams, useRouter } from "expo-router"
import { Dog } from "lucide-react-native"
import * as React from "react"
import { ScrollView, Switch, View } from "react-native"
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated"

import type { SpotType } from "@ramble/database/types"
import { isCampingSpot } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { FormInputLabel } from "~/components/ui/FormInput"
import { Input } from "~/components/ui/Input"
import { Text } from "~/components/ui/Text"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"

import { NewSpotModalView } from "./NewSpotModalView"

export default function NewSpotInfoScreen() {
  useKeyboardController()
  const keyboard = useAnimatedKeyboard()
  const translateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -keyboard.height.value }],
    }
  })

  const params = useLocalSearchParams<{
    type: SpotType
    name?: string
    isPetFriendly?: "true" | "false"
  }>()

  const router = useRouter()
  const [name, setName] = React.useState<string>(params.name || "")
  const [description, setDescription] = React.useState<string>()
  const [isPetFriendly, setIsPetFriendly] = React.useState(
    params.isPetFriendly === undefined ? true : params.isPetFriendly === "true",
  )

  return (
    <NewSpotModalView title="some info">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
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

      <Animated.View
        style={[translateStyle]}
        className="absolute right-4 bottom-12 left-4 flex items-center justify-center space-y-2"
      >
        <Button
          className="rounded-full"
          disabled={!name}
          onPress={() => {
            if (!name) return
            const searchParams = new URLSearchParams({
              ...params,
              name,
              description: description || "",
              isPetFriendly: String(isPetFriendly),
            })
            router.push(
              // @ts-ignore
              isCampingSpot(params.type) ? `/new/amenities?${searchParams}` : `/new/images?${searchParams}`,
            )
          }}
        >
          Next
        </Button>
      </Animated.View>
    </NewSpotModalView>
  )
}
