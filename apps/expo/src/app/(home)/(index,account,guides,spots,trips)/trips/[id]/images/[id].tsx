import { Image } from "expo-image"
import { useLocalSearchParams } from "expo-router"
import { ScreenView } from "~/components/ui/ScreenView"

export default function TripImage() {
  const { image } = useLocalSearchParams<{ image: string }>()

  return (
    <ScreenView title="Image">
      <Image source={{ uri: image }} style={{ width: "100%", height: 400 }} />
    </ScreenView>
  )
}
