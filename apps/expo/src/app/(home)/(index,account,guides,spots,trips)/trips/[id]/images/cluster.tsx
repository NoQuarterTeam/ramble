import { createImageUrl } from "@ramble/shared"
import { FlashList } from "@shopify/flash-list"
import { Image } from "expo-image"
import { Link, useLocalSearchParams } from "expo-router"
import * as React from "react"
import { ActivityIndicator, TouchableOpacity, View } from "react-native"
import { ScreenView } from "~/components/ui/ScreenView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { width } from "~/lib/device"

const size = width / 3

export default function TripImagesCluster() {
  const { id, bounds } = useLocalSearchParams<{ id: string; bounds?: string }>()
  const parsedBounds = bounds?.split(",").map(Number)

  const { data, isLoading } = api.trip.media.byBounds.useQuery(
    { bounds: parsedBounds!, skip: 0, tripId: id },
    { enabled: !!parsedBounds },
  )

  const total = data?.total || 0

  const [images, setImages] = React.useState(data?.items || [])

  React.useEffect(() => {
    setImages(data?.items || [])
  }, [data?.items])

  const utils = api.useUtils()

  // biome-ignore lint/correctness/useExhaustiveDependencies: allow dat
  const handleLoadMore = React.useCallback(async () => {
    if (!parsedBounds || total === images.length) return
    try {
      const newImages = await utils.trip.media.byBounds.fetch({ tripId: id, bounds: parsedBounds, skip: images?.length || 0 })
      setImages([...(images || []), ...newImages.items])
    } catch {
      toast({ title: "Failed to load more images", type: "error" })
    }
  }, [images, total, parsedBounds, id])

  return (
    <ScreenView title="" containerClassName="px-0">
      {isLoading ? (
        <View className="p-4 flex items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : !images ? null : (
        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={size}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          numColumns={3}
          ListEmptyComponent={<Text className="text-center">No images yet</Text>}
          data={images}
          renderItem={({ item }) => (
            <Link href={`/(home)/(trips)/trips/${id}/images/${item.id}?bounds=${bounds}`} asChild>
              <TouchableOpacity style={{ width: size, height: size }}>
                <Image className="bg-gray-200 dark:bg-gray-700 h-full w-full" source={{ uri: createImageUrl(item.path) }} />
              </TouchableOpacity>
            </Link>
          )}
        />
      )}
    </ScreenView>
  )
}
