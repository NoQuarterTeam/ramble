import { createImageUrl } from "@ramble/shared"
import { FlashList } from "@shopify/flash-list"
import { Image } from "expo-image"
import { Link, useLocalSearchParams } from "expo-router"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { ScreenView } from "~/components/ui/ScreenView"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { width } from "~/lib/device"

const size = (width - 16) / 3

export default function TripImagesCluster() {
  const { id, bounds } = useLocalSearchParams<{ id: string; bounds?: string }>()
  const parsedBounds = bounds?.split(",").map(Number)

  const { data } = api.trip.media.byBounds.useQuery(
    { bounds: parsedBounds!, skip: 0 },
    { enabled: !!parsedBounds, staleTime: Infinity, cacheTime: Infinity },
  )

  const [images, setImages] = React.useState(data)

  React.useEffect(() => {
    setImages(data)
  }, [data])

  const utils = api.useUtils()

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const handleLoadMore = React.useCallback(async () => {
    if (!parsedBounds) return
    const newImages = await utils.trip.media.byBounds.fetch({ bounds: parsedBounds, skip: images?.length || 0 })
    setImages([...(images || []), ...newImages])
  }, [images, parsedBounds])

  return (
    <ScreenView title="" containerClassName="px-0">
      <FlashList
        showsVerticalScrollIndicator={false}
        estimatedItemSize={142}
        onEndReached={handleLoadMore}
        numColumns={3}
        ListEmptyComponent={<Text className="text-center">No guides yet</Text>}
        data={images}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        renderItem={({ item }) => (
          <Link href={`/(home)/(trips)/trips/${id}/images/${item.id}?bounds=${bounds}`} asChild>
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
