import { createImageUrl } from "@ramble/shared"
import { Image } from "expo-image"
import { useLocalSearchParams } from "expo-router"
import { View } from "react-native"
import { ScreenView } from "~/components/ui/ScreenView"

export default function TripImage() {
  const { path } = useLocalSearchParams<{ path: string }>()

  return (
    <ScreenView title="" containerClassName="px-0">
      <View className="pb-2 flex-1">
        <Image source={{ uri: createImageUrl(path) }} className="flex-1 h-full" contentFit="contain" />
      </View>
    </ScreenView>
  )
}
