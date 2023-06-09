import { SpotImage } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"
import { FlashList } from "@shopify/flash-list"
import * as React from "react"
import { View } from "react-native"

import { Text } from "./Text"
import { Image } from "expo-image"

export function ImageCarousel({
  images,
  width,
  height,
}: {
  width: number
  height: number
  images: Pick<SpotImage, "id" | "path">[]
}) {
  const [imageIndex, setImageIndex] = React.useState(0)

  if (images.length === 0) return <View style={{ width, height }} className="bg-gray-100 dark:bg-gray-700" />
  return (
    <View style={{ width, height }}>
      <FlashList
        pagingEnabled
        horizontal
        onScrollEndDrag={(e) => {
          const { x } = e.nativeEvent.contentOffset
          const index = Math.round(x / width)
          setImageIndex(index)
        }}
        estimatedItemSize={width}
        showsHorizontalScrollIndicator={false}
        data={images}
        renderItem={({ item: image }) => (
          <Image source={{ uri: createImageUrl(image.path) }} style={{ width, height }} className="object-cover" />
        )}
      />
      <View className="absolute bottom-2 right-2 rounded bg-gray-800/70 p-1">
        <Text className="text-xs text-white">{`${imageIndex + 1}/${images.length}`}</Text>
      </View>
    </View>
  )
}
