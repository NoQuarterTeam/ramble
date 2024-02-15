import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { Image } from "lucide-react-native"

import { type SpotImage } from "@ramble/database/types"
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

interface Props {
  width: number
  height: number
  noOfColumns?: number
  images: SpotImageType[]
  imageClassName?: string
  onPress?: () => void
}

export function SpotImageCarousel({
  images,
  width,
  height,
  noOfColumns,
  spotId,
  imageClassName,
  canAddMore,
  onPress,
}: Props & (AddMoreProps | NoAddMoreProps)) {
  const { me } = useMe()
  const [imageIndex, setImageIndex] = React.useState(0)
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
      let message
      if (error instanceof Error) message = error.message
      else message = String(error)
      toast({ title: "Error selecting image", message, type: "error" })
    }
  }

  const ref = React.useRef<FlashList<SpotImageType>>(null)
  const itemWidth = width / (noOfColumns || 1) - (noOfColumns && noOfColumns > 1 ? 10 : 0)
  return (
    <View style={{ width, height }} className="bg-background dark:bg-background-dark">
      {images.length > 0 ? (
        <FlashList
          ref={ref}
          pagingEnabled
          scrollEnabled
          horizontal
          onMomentumScrollEnd={(e) => {
            const { x } = e.nativeEvent.contentOffset
            const index = Math.round(x / width)
            setImageIndex(index)
          }}
          estimatedItemSize={width}
          showsHorizontalScrollIndicator={false}
          data={images}
          ListFooterComponent={
            canAddMore ? (
              <View style={{ width, height }} className="rounded-xs flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <Icon icon={Image} size={40} strokeWidth={1} className="mb-2" />
                {me ? (
                  <>
                    {images.length === 0 && <Text className="my-2 text-sm">Be the first to add an image</Text>}
                    <Button size="sm" variant="outline" onPress={onPickImage}>
                      Upload
                    </Button>
                  </>
                ) : (
                  <Text className="my-2 text-sm">No images yet</Text>
                )}
              </View>
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
      ) : (
        <View style={{ width, height }} className="rounded-xs flex items-center justify-center bg-gray-50 dark:bg-gray-800">
          <Icon icon={Image} size={40} strokeWidth={1} className="mb-2" />
          <Text className="my-2 text-sm">No images yet</Text>
        </View>
      )}

      {images.length > 0 && (
        <View className="rounded-xs absolute bottom-2 right-2 bg-gray-800/70 p-1">
          <Text className="text-xs text-white">{`${imageIndex + 1}/${
            images.length / (noOfColumns || 1) + (canAddMore ? 1 : 0)
          }`}</Text>
        </View>
      )}
    </View>
  )
}
