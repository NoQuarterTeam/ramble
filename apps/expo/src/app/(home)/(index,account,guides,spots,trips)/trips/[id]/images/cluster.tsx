import { createImageUrl } from "@ramble/shared"
import { Image } from "expo-image"
import { Link, useLocalSearchParams } from "expo-router"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { ScreenView } from "~/components/ui/ScreenView"
import { api } from "~/lib/api"
import { width } from "~/lib/device"

const size = (width - 16) / 3

export default function TripImagesCluster() {
  const { id, bounds } = useLocalSearchParams<{ id: string; bounds?: string }>()
  const parsedBounds = bounds?.split(",").map(Number)

  const { data } = api.trip.media.byBounds.useQuery(
    { bounds: parsedBounds! },
    { enabled: !!parsedBounds, staleTime: Infinity, cacheTime: Infinity },
  )

  return (
    <ScreenView title="" containerClassName="px-0">
      <ScrollView className="flex-1 pt-2">
        <View className="flex flex-wrap flex-row gap-1">
          {data?.map((image) => (
            <Link key={image.id} href={`/(home)/(trips)/trips/${id}/images/${image.id}?bounds=${bounds}`} asChild>
              <TouchableOpacity>
                <Image
                  className="bg-gray-200 dark:bg-gray-700"
                  source={{ uri: createImageUrl(image.path) }}
                  style={{ width: size, height: size }}
                />
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>
    </ScreenView>
  )
}
