import { createAssetUrl } from "@ramble/shared"
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
import { useTabSegment } from "~/lib/hooks/useTabSegment"
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

  const [media, setMedia] = React.useState(data?.items || [])

  React.useEffect(() => {
    setMedia(data?.items || [])
  }, [data?.items])

  const utils = api.useUtils()

  // biome-ignore lint/correctness/useExhaustiveDependencies: allow dat
  const handleLoadMore = React.useCallback(async () => {
    if (!parsedBounds || total === media.length) return
    try {
      const newMedia = await utils.trip.media.byBounds.fetch({ tripId: id, bounds: parsedBounds, skip: media?.length || 0 })
      setMedia([...(media || []), ...newMedia.items])
    } catch {
      toast({ title: "Failed to load more", type: "error" })
    }
  }, [media, total, parsedBounds, id])

  const tab = useTabSegment()
  return (
    <ScreenView containerClassName="px-0">
      {isLoading ? (
        <View className="flex items-center justify-center p-4">
          <ActivityIndicator />
        </View>
      ) : !media ? null : (
        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={size}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          numColumns={3}
          ListEmptyComponent={<Text className="text-center">Nothing here yet</Text>}
          data={media}
          renderItem={({ item }) => (
            <Link href={`/${tab}/trip/${id}/media/${item.id}?bounds=${bounds}`} asChild>
              <TouchableOpacity style={{ width: size, height: size }}>
                {item.type === "VIDEO" ? (
                  <View className="w-full h-full flex items-center justify-center">
                    {item.thumbnailPath ? (
                      <Image
                        className="h-full w-full bg-gray-200 dark:bg-gray-700"
                        source={{ uri: createAssetUrl(item.thumbnailPath) }}
                      />
                    ) : (
                      <View className="flex space-y-1 px-4 items-center">
                        <Icon icon={ImageOff} />
                        <Text className="text-xs text-center">Preview unavailable</Text>
                      </View>
                    )}
                    {item.duration && (
                      <Text className="absolute text-xs bottom-1 right-1 text-white font-700">
                        {formatVideoDuration(item.duration)}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Image className="h-full w-full bg-gray-200 dark:bg-gray-700" source={{ uri: createAssetUrl(item.path) }} />
                )}
              </TouchableOpacity>
            </Link>
          )}
        />
      )}
    </ScreenView>
  )
}
