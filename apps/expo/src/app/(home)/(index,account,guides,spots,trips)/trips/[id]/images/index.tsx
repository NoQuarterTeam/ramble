import { createImageUrl } from "@ramble/shared"
import { FlashList } from "@shopify/flash-list"
import { Image } from "expo-image"
import { Link, useLocalSearchParams } from "expo-router"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { ScreenView } from "~/components/ui/ScreenView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { width } from "~/lib/device"

const size = (width - 16) / 3

export default function TripImages() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data } = api.trip.media.all.useQuery({ tripId: id, skip: 0 })

  const [images, setImages] = React.useState(data)

  React.useEffect(() => {
    setImages(data)
  }, [data])

  const utils = api.useUtils()

  // biome-ignore lint/correctness/useExhaustiveDependencies: allow dat
  const handleLoadMore = React.useCallback(async () => {
    try {
      const newImages = await utils.trip.media.all.fetch({ tripId: id, skip: images?.length || 0 })
      setImages([...(images || []), ...newImages])
    } catch {
      toast({ title: "Failed to load more images", type: "error" })
    }
  }, [images, id])

  return (
    <ScreenView title="" containerClassName="px-0">
      <FlashList
        showsVerticalScrollIndicator={false}
        estimatedItemSize={142}
        onEndReached={handleLoadMore}
        numColumns={3}
        ListEmptyComponent={<Text className="text-center">No images yet</Text>}
        data={images}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        renderItem={({ item }) => (
          <Link href={`/(home)/(trips)/trips/${id}/images/${item.id}`} asChild>
            <TouchableOpacity>
              <Image
                className="bg-gray-200 dark:bg-gray-700"
                source={{ uri: createImageUrl(item.path) }}
                style={{ width: size, height: size }}
              />
            </TouchableOpacity>
          </Link>
        )}
      />
    </ScreenView>
  )
}
