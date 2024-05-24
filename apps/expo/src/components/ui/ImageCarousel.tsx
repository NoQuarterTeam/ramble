import { merge } from "@ramble/shared"
import { FlashList } from "@shopify/flash-list"
import { Image } from "expo-image"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { Text } from "./Text"

type Props = {
  width: number
  height: number
  noOfColumns?: number
  images: string[]
  imageClassName?: string
  onPress?: () => void
}

export function ImageCarousel({ images, width, height, noOfColumns, imageClassName, onPress }: Props) {
  const [imageIndex, setImageIndex] = React.useState(0)
  const ref = React.useRef<FlashList<string>>(null)
  const itemWidth = width / (noOfColumns || 1) - (noOfColumns && noOfColumns > 1 ? 10 : 0)

  return (
    <View style={{ width, height }} className="bg-background dark:bg-background-dark">
      <FlashList
        ref={ref}
        pagingEnabled
        scrollEnabled={images.length > 1}
        horizontal
        onMomentumScrollEnd={(e) => {
          const { x } = e.nativeEvent.contentOffset
          const index = Math.round(x / width)
          setImageIndex(index)
        }}
        estimatedItemSize={width}
        showsHorizontalScrollIndicator={false}
        data={images}
        renderItem={({ item: image }) => (
          <TouchableOpacity onPress={onPress} activeOpacity={1}>
            <Image
              source={{ uri: image }}
              style={{ width: itemWidth, height, marginHorizontal: noOfColumns && noOfColumns > 1 ? 5 : 0 }}
              className={merge("rounded-xs object-cover", imageClassName)}
            />
          </TouchableOpacity>
        )}
      />
      {images.length > 1 && (
        <View className="absolute bottom-2 left-2">
          <View className="rounded-xs bg-gray-800/70 p-1">
            <Text className="text-white text-xs">{`${imageIndex + 1}/${images.length / (noOfColumns || 1)}`}</Text>
          </View>
        </View>
      )}
    </View>
  )
}
