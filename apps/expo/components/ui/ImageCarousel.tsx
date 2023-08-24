import * as React from "react"
import { View, TouchableOpacity } from "react-native"
import { FlashList } from "@shopify/flash-list"

import { createImageUrl, merge } from "@ramble/shared"

import { OptimizedImage } from "./OptimisedImage"
import { Text } from "./Text"

export function ImageCarousel({
  images,
  width,
  height,
  imageClassName,
  onPress,
}: {
  width: number
  height: number
  images: { id: string; path: string; blurHash?: string | null }[]
  imageClassName?: string
  onPress?: () => void
}) {
  const [imageIndex, setImageIndex] = React.useState(0)

  if (images.length === 0) return <View style={{ width, height }} className="bg-gray-100 dark:bg-gray-700" />
  return (
    <View style={{ width, height }} className="bg-gray-600">
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
          <TouchableOpacity onPress={onPress} activeOpacity={1}>
            <OptimizedImage
              width={width}
              height={height}
              placeholder={image.blurHash}
              source={{ uri: createImageUrl(image.path) }}
              style={{ width, height }}
              className={merge("object-cover", imageClassName)}
            />
          </TouchableOpacity>
        )}
      />
      <View className="absolute bottom-2 right-2 rounded bg-gray-800/70 p-1">
        <Text className="text-xs text-white">{`${imageIndex + 1}/${images.length}`}</Text>
      </View>
    </View>
  )
}
