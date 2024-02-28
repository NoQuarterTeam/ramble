import { createImageUrl } from "@ramble/shared"
import { Image } from "expo-image"
import { Link, useLocalSearchParams } from "expo-router"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { ScreenView } from "~/components/ui/ScreenView"
import { width } from "~/lib/device"

const size = (width - 16) / 3
export default function TripImages() {
  const { id, images } = useLocalSearchParams<{ id: string; images?: string }>()

  const imageUrls = images?.split(",")

  return (
    <ScreenView title="" containerClassName="px-0">
      <ScrollView className="flex-1 pt-2">
        <View className="flex flex-wrap flex-row gap-2">
          {imageUrls?.map((url) => (
            <Link key={url} href={`/(home)/(trips)/trips/${id}/images/${url}`} asChild>
              <TouchableOpacity>
                <Image source={{ uri: createImageUrl(url) }} style={{ width: size, height: size }} />
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>
    </ScreenView>
  )
}
