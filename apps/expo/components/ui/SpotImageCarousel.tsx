import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import * as ImagePicker from "expo-image-picker"
import { Image } from "lucide-react-native"

import { type SpotImage } from "@ramble/database/types"
import { createImageUrl, merge } from "@ramble/shared"

import { useRouter } from "../../app/router"
import { useMe } from "../../lib/hooks/useMe"
import { Button } from "./Button"
import { OptimizedImage } from "./OptimisedImage"
import { Text } from "./Text"
import { toast } from "./Toast"

type SpotImageType = Pick<SpotImage, "id" | "path" | "blurHash">
export function SpotImageCarousel({
  images,
  width,
  height,
  spotId,
  imageClassName,
  onPress,
}: {
  width: number
  spotId: string
  height: number
  images: SpotImageType[]
  imageClassName?: string
  onPress?: () => void
}) {
  const { me } = useMe()
  const [imageIndex, setImageIndex] = React.useState(0)
  const { navigate } = useRouter()
  const onPickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      })
      if (result.canceled || result.assets.length === 0) return

      navigate("SaveSpotImagesScreen", { id: spotId, images: result.assets.map((asset) => asset.uri) })
    } catch (error) {
      console.log(error)
      let message
      if (error instanceof Error) message = error.message
      else message = String(error)
      toast({ title: "Error selecting image", message, type: "error" })
    }
  }

  const ref = React.useRef<FlashList<SpotImageType>>(null)

  return (
    <View style={{ width, height }} className="bg-background dark:bg-background-dark">
      <FlashList
        ref={ref}
        pagingEnabled={images.length > 0}
        scrollEnabled={images.length > 0}
        horizontal
        onScrollEndDrag={(e) => {
          const { x } = e.nativeEvent.contentOffset
          const index = Math.round(x / width)
          setImageIndex(index)
        }}
        estimatedItemSize={width}
        showsHorizontalScrollIndicator={false}
        data={images}
        ListFooterComponent={
          <View style={{ width, height }} className="rounded-xs flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <Image size={40} strokeWidth={1} className="mb-2 text-black dark:text-white" />
            {me && (
              <>
                {images.length === 0 && <Text className="my-2 text-sm">Be the first to add an image</Text>}
                <Button size="sm" variant="outline" onPress={onPickImage}>
                  Upload
                </Button>
              </>
            )}
          </View>
        }
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
      {images.length > 0 && (
        <View className="rounded-xs absolute bottom-2 right-2 bg-gray-800/70 p-1">
          <Text className="text-xs text-white">{`${imageIndex + 1}/${images.length + 1}`}</Text>
        </View>
      )}
    </View>
  )
}
