import { FlashList } from "@shopify/flash-list"
import relativeTime from "dayjs/plugin/relativeTime"
import * as ImagePicker from "expo-image-picker"
import { router, useRouter } from "expo-router"
import { Image, User2 } from "lucide-react-native"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"

import type { Spot } from "@ramble/database/types"
import { createAssetUrl, merge } from "@ramble/shared"

import { useMe } from "~/lib/hooks/useMe"

import dayjs from "dayjs"
import type { RouterOutputs } from "~/lib/api"
import { useFeedbackActivity } from "../FeedbackCheck"
import { Icon } from "../Icon"
import { Button } from "./Button"
import { OptimizedImage } from "./OptimisedImage"
import { Text } from "./Text"
import { toast } from "./Toast"
dayjs.extend(relativeTime)

type AddMoreProps = {
  canAddMore: true
  spot: Pick<Spot, "id" | "ownerId">
}

type NoAddMoreProps = {
  canAddMore?: false
  spot?: Pick<Spot, "id" | "ownerId">
}

type Props = {
  width: number
  height: number
  noOfColumns?: number
  images: RouterOutputs["spot"]["detail"]["spot"]["images"]
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
  spot,
  imageClassName,
  canAddMore,
  onPress,
}: Props) {
  const increment = useFeedbackActivity((s) => s.increment)
  const [imageIndex, setImageIndex] = React.useState(0)
  const ref = React.useRef<FlashList<RouterOutputs["spot"]["detail"]["spot"]["images"][0]>>(null)
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
            <Footer placeholderPaddingTop={placeholderPaddingTop} width={itemWidth} height={height} images={images} spot={spot} />
          ) : undefined
        }
        renderItem={({ item: image }) => (
          <View className="relative">
            <TouchableOpacity onPress={onPress} activeOpacity={1}>
              <OptimizedImage
                width={itemWidth}
                height={height}
                placeholder={image.blurHash}
                source={{ uri: createAssetUrl(image.path) }}
                style={{ width: itemWidth, height, marginHorizontal: noOfColumns && noOfColumns > 1 ? 5 : 0 }}
                className={merge("rounded-xs object-cover", imageClassName)}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                increment()
                if (image.creator.deletedAt) return
                router.push(`/(home)/(index)/${image.creator.username}/(profile)`)
              }}
              activeOpacity={image.creator.deletedAt ? 1 : 0.7}
              className="absolute bottom-2 right-2 p-1 pr-2 rounded-full bg-gray-800/70 flex flex-row space-x-1 items-center"
            >
              {image.creator?.avatar ? (
                <OptimizedImage
                  height={30}
                  width={30}
                  placeholder={image.creator.avatarBlurHash}
                  source={{ uri: createAssetUrl(image.creator.avatar) }}
                  className="sq-7 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
                />
              ) : (
                <View className="sq-7 flex flex-row items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
                  <Icon icon={User2} size={18} />
                </View>
              )}
              <View className="max-w-[65px]">
                <Text className="text-white text-xs leading-3" numberOfLines={1}>
                  {image.creator.username}
                </Text>
                <Text className="text-white text-xxs leading-3" numberOfLines={1}>
                  {dayjs(image.createdAt).format("DD/MM/YYYY")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
      {images.length > 1 && (
        <View className="absolute bottom-2 left-2">
          <View className="rounded-xs bg-gray-800/70 p-1">
            <Text className="text-white text-xs">
              {`${imageIndex + 1}/${images.length / (noOfColumns || 1) + (canAddMore ? 1 : 0)}`}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

function Footer({
  width,
  height,
  images,
  spot,
  placeholderPaddingTop = 0,
}: Pick<Props, "placeholderPaddingTop" | "width" | "height" | "images" | "canAddMore" | "spot">) {
  const { me } = useMe()
  const router = useRouter()
  const onPickImage = async () => {
    if (!spot) return
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
      router.push(`/spot/${spot.id}/save-spot-images?${searchParams}`)
    } catch (error) {
      let message: string
      if (error instanceof Error) message = error.message
      else message = String(error)
      toast({ title: "Error selecting image", message, type: "error" })
    }
  }
  if (images.length === 0) return null
  return (
    <View
      style={{ width, height, paddingTop: placeholderPaddingTop }}
      className="flex items-center justify-center rounded-xs bg-gray-50 dark:bg-gray-800"
    >
      <Icon icon={Image} size={40} strokeWidth={1} className="mb-2" />
      {me ? (
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
