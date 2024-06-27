import { useLocalSearchParams, useRouter } from "expo-router"
import { Dog } from "lucide-react-native"
import * as React from "react"
import { ScrollView, Switch, View } from "react-native"
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated"

import type { SpotType } from "@ramble/database/types"
import { AMENITIES, isCampingSpot } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { FormInputLabel, FormInputSubLabel } from "~/components/ui/FormInput"
import { Input } from "~/components/ui/Input"
import { Text } from "~/components/ui/Text"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { type AmenityObject, AmenitySelector } from "~/components/AmenitySelector"
import { AMENITIES_ICONS } from "~/lib/models/amenities"
import { EditSpotModalView } from "./EditSpotModalView"

export default function EditSpotOptionsScreen() {
  useKeyboardController()
  const keyboard = useAnimatedKeyboard()
  const translateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -keyboard.height.value }],
    }
  })
  const { id, ...params } = useLocalSearchParams<{
    id: string
    type: SpotType
    name: string
    description: string
    isPetFriendly: string
    amenities?: string
  }>()

  const [amenities, setAmenities] = React.useState(
    params.amenities
      ? Object.entries(JSON.parse(params.amenities)).reduce((acc, [key, value]) => {
          acc[key as keyof typeof AMENITIES] = value as boolean
          return acc
        }, {} as AmenityObject)
      : Object.keys(AMENITIES).reduce((acc, key) => {
          acc[key as keyof typeof AMENITIES] = false
          return acc
        }, {} as AmenityObject),
  )

  const [name, setName] = React.useState<string>(params.name)
  const [description, setDescription] = React.useState(params.description)
  const [isPetFriendly, setIsPetFriendly] = React.useState(params.isPetFriendly === "true")
  const router = useRouter()
  const tab = useTabSegment()

  return (
    <EditSpotModalView title="some info">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <FormInputLabel label="Name" />
        <Input value={name} onChangeText={setName} />

        <View className="flex w-full flex-row items-center justify-between pt-4 pb-1">
          <View className="flex flex-row items-center space-x-2">
            <Icon icon={Dog} size={20} />
            <Text className="text-xl">Suitable for pets</Text>
          </View>
          <Switch
            trackColor={{ true: colors.primary[600] }}
            value={isPetFriendly}
            onValueChange={() => setIsPetFriendly((p) => !p)}
          />
        </View>

        {isCampingSpot(params.type) &&
          Object.entries(AMENITIES).map(([key, label]) => (
            <AmenitySelector
              key={key}
              label={label}
              icon={AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]}
              isSelected={!!amenities[key as keyof typeof AMENITIES]}
              onToggle={() => setAmenities((a) => ({ ...a, [key]: !a[key as keyof typeof AMENITIES] }))}
            />
          ))}

        <View className="pt-6">
          <FormInputSubLabel subLabel="Anything else worth mentioning?" name="description" />
          <Input
            nativeID="description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholder="e.g. narrow entrance, not suitable for large campers"
          />
        </View>
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
              description,
              isPetFriendly: isPetFriendly.toString(),
              amenities: amenities ? JSON.stringify(amenities) : "",
            })
            router.push(`/${tab}/spot/${id}/edit/images?${searchParams}`)
          }}
        >
          Next
        </Button>
      </Animated.View>
    </EditSpotModalView>
  )
}
