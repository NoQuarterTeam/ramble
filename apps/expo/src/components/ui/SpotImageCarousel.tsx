import { FlashList } from "@shopify/flash-list"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { Image } from "lucide-react-native"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"

import type { SpotImage } from "@ramble/database/types"
import { createImageUrl, merge } from "@ramble/shared"

import { useMe } from "~/lib/hooks/useMe"

import { Icon } from "../Icon"
import { Button } from "./Button"
import { OptimizedImage } from "./OptimisedImage"
import { Text } from "./Text"
import { toast } from "./Toast"

type SpotImageType = Pick<SpotImage, "path" | "blurHash">

type AddMoreProps = {
  canAddMore: true
  spotId: string
}

type NoAddMoreProps = {
  canAddMore?: false
  spotId?: undefined
}

type Props = {
  width: number
  height: number
  noOfColumns?: number
  images: SpotImageType[]
  imageClassName?: string
  onPress?: () => void
  placeholderPaddingTop?: number
} & (AddMoreProps | NoAddMoreProps)

export function SpotImageCarousel({
  images,
  placeholderPaddingTop,
  width,
  height,
  noOfColumns,
  spotId,
  imageClassName,
  canAddMore,
  onPress,
}: Props) {
  const [imageIndex, setImageIndex] = React.useState(0)

  const ref = React.useRef<FlashList<SpotImageType>>(null)
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
        ListEmptyComponent={
          !canAddMore ? <Empty placeholderPaddingTop={placeholderPaddingTop} width={itemWidth} height={height} /> : undefined
        }
        ListFooterComponent={
          canAddMore ? (
            <Footer
              placeholderPaddingTop={placeholderPaddingTop}
              width={itemWidth}
              height={height}
              images={images}
              canAddMore={canAddMore}
              spotId={spotId}
            />
          ) : undefined
        }
        renderItem={({ item: image }) => (
          <TouchableOpacity onPress={onPress} activeOpacity={1}>
            <OptimizedImage
              width={itemWidth}
              height={height}
              placeholder={image.blurHash}
              source={{ uri: createImageUrl(image.path) }}
              style={{ width: itemWidth, height, marginHorizontal: noOfColumns && noOfColumns > 1 ? 5 : 0 }}
              className={merge("rounded-xs object-cover", imageClassName)}
            />
          </TouchableOpacity>
        )}
      />
      {images.length > 1 && (
        <View className="absolute right-2 bottom-2 rounded-xs bg-gray-800/70 p-1">
          <Text className="text-white text-xs">{`${imageIndex + 1}/${
            images.length / (noOfColumns || 1) + (canAddMore ? 1 : 0)
          }`}</Text>
        </View>
      )}
    </View>
  )
}

function Footer({
  width,
  height,
  images,
  canAddMore,
  spotId,
  placeholderPaddingTop = 0,
}: Pick<Props, "placeholderPaddingTop" | "width" | "height" | "images" | "canAddMore" | "spotId">) {
  const { me } = useMe()
  const router = useRouter()
  const onPickImage = async () => {
    if (!canAddMore) return
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      })
      if (result.canceled || result.assets.length === 0) return
      const searchParams = new URLSearchParams({
        images: result.assets.map((asset) => asset.uri).join(","),
      })
      router.push(`/spot/${spotId}/save-spot-images?${searchParams}`)
    } catch (error) {
      let message: string
      if (error instanceof Error) message = error.message
      else message = String(error)
      toast({ title: "Error selecting image", message, type: "error" })
    }
  }
  if (!canAddMore && images.length === 0) return null
  return (
    <View
      style={{ width, height, paddingTop: placeholderPaddingTop }}
      className="flex items-center justify-center rounded-xs bg-gray-50 dark:bg-gray-800"
    >
      <Icon icon={Image} size={40} strokeWidth={1} className="mb-2" />
      {me && canAddMore ? (
        <>
          {images.length === 0 && <Text className="my-2 text-sm">Be the first to add an image</Text>}
          <Button size="sm" variant="outline" onPress={onPickImage}>
            Upload your own
          </Button>
        </>
      ) : (
        <Text className="my-2 text-sm">No images yet</Text>
      )}
    </View>
  )
}

export function Empty({ width, height, placeholderPaddingTop = 0 }: Pick<Props, "placeholderPaddingTop" | "width" | "height">) {
  return (
    <View
      style={{ width, height, paddingTop: placeholderPaddingTop }}
      className="flex items-center justify-center rounded-xs bg-gray-50 dark:bg-gray-800"
    >
      <Icon icon={Image} size={40} strokeWidth={1} className="mb-2" />
      <Text className="my-2 text-sm">No images yet</Text>
    </View>
  )
}
