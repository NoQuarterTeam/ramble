import { createS3Url } from "@ramble/shared"
import { FlashList } from "@shopify/flash-list"
import { Image } from "expo-image"
import { Link, useLocalSearchParams } from "expo-router"
import { ImageOff } from "lucide-react-native"
import * as React from "react"
import { ActivityIndicator, TouchableOpacity, View } from "react-native"
import { Icon } from "~/components/Icon"
import { ScreenView } from "~/components/ui/ScreenView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { width } from "~/lib/device"
import { formatVideoDuration } from "~/lib/utils"

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
        <View className="flex items-center justify-center p-4">
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
                {item.thumbnailPath ? (
                  <View className="w-full h-full flex items-center justify-center">
                    {item.thumbnailPath ? (
                      <Image
                        className="h-full w-full bg-gray-200 dark:bg-gray-700"
                        source={{ uri: createS3Url(item.thumbnailPath) }}
                      />
                    ) : (
                      <View className="flex space-y-1 px-4 items-center">
                        <Icon icon={ImageOff} />
                        <Text className="text-xs text-center">Preview unavailable</Text>
                      </View>
                    )}
                    {item.duration && (
                      <Text className="absolute bottom-1 right-1 font-600">{formatVideoDuration(item.duration)}</Text>
                    )}
                  </View>
                ) : (
                  <Image className="h-full w-full bg-gray-200 dark:bg-gray-700" source={{ uri: createS3Url(item.path) }} />
                )}
              </TouchableOpacity>
            </Link>
          )}
        />
      )}
    </ScreenView>
  )
}
