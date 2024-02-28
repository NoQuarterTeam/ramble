import { createImageUrl } from "@ramble/shared"
import { Image } from "expo-image"
import { useLocalSearchParams } from "expo-router"
import { ScreenView } from "~/components/ui/ScreenView"

export default function TripImage() {
  const { path } = useLocalSearchParams<{ path: string }>()

  return (
    <ScreenView title="Image">
      <Image source={{ uri: createImageUrl(path) }} style={{ width: "100%", height: 400 }} />
    </ScreenView>
  )
}
