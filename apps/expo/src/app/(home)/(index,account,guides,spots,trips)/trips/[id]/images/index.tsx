import { Image } from "expo-image"
import { useLocalSearchParams } from "expo-router"
import { ScreenView } from "~/components/ui/ScreenView"

export default function TripImages() {
  const { images } = useLocalSearchParams<{ images?: string }>()

  const imageUrls = images?.split(",")

  return (
    <ScreenView title="Images">
      {imageUrls?.map((url) => (
        <Image key={url} source={{ uri: url }} style={{ width: 100, height: 100 }} />
      ))}
    </ScreenView>
  )
}
