import * as React from "react"
import { ScrollView, TouchableOpacity, View, ViewProps } from "react-native"
import Carousel from "react-native-reanimated-carousel"
import { Image } from "expo-image"
import { useLocalSearchParams, useNavigation } from "expo-router"
import { BadgeX, ChevronLeft, Star, Verified } from "lucide-react-native"

import { type SpotImage } from "@ramble/database/types"
import { createImageUrl, merge } from "@ramble/shared"

import { Button } from "../../components/Button"
import { Heading } from "../../components/Heading"
import { Link } from "../../components/Link"
import { ReviewItem } from "../../components/ReviewItem"
import { Text } from "../../components/Text"
import { api } from "../../lib/api"
import { width } from "../../lib/device"

export default function SpotDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data, isLoading } = api.spot.detail.useQuery({ id: id || "" }, { enabled: !!id })
  const spot = data

  const navigation = useNavigation()
  if (isLoading) return <SpotLoading />
  if (!spot)
    return (
      <View className="space-y-2 px-4 pt-20">
        <Text className="text-lg">Spot now found</Text>
        {navigation.canGoBack() && <Button onPress={navigation.goBack}>Back</Button>}
      </View>
    )
  return (
    <ScrollView>
      <ImageCarousel images={spot.images} />

      {navigation.canGoBack() && (
        <TouchableOpacity
          onPress={navigation.goBack}
          activeOpacity={0.8}
          className="absolute left-6 top-12 flex items-center justify-center rounded-full bg-white p-1 dark:bg-gray-800"
        >
          <ChevronLeft className="pr-1 text-black dark:text-white" />
        </TouchableOpacity>
      )}

      <View className="space-y-4 p-4">
        <View className="space-y-2">
          {spot.verifiedAt && spot.verifier ? (
            <View className="flex flex-row items-center space-x-1">
              <Verified size={20} className="text-black dark:text-white" />
              <Text className="text-sm">Verified by</Text>
              <Link href={`/${spot.verifier.username}`} className="flex text-sm">
                {`${spot.verifier.firstName} ${spot.verifier.lastName}`}
              </Link>
            </View>
          ) : (
            <View className="flex flex-row items-center space-x-1">
              <BadgeX size={20} className="text-black dark:text-white" />
              <Text className="text-sm">Unverified</Text>
            </View>
          )}
          <Heading className="text-2xl leading-7">{spot.name}</Heading>
          <View className="flex flex-row items-center space-x-1">
            <Star size={20} className="text-black dark:text-white" />
            <Text className="text-sm">{spot.rating._avg.rating ? spot.rating._avg.rating?.toFixed(1) : "Not rated"}</Text>
            <Text className="text-sm">·</Text>
            <Text className="text-sm">
              {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
            </Text>
          </View>
        </View>

        <View className="h-px w-full bg-gray-200 dark:bg-gray-600" />
        <View className="space-y-1">
          <View>
            <Text>{spot.description}</Text>
          </View>
          <Text className="text-sm">{spot.address}</Text>
        </View>
        <View className="h-px w-full bg-gray-200 dark:bg-gray-600" />
        <View className="space-y-2">
          <View className="flex flex-row justify-between">
            <View className="flex flex-row items-center space-x-2">
              <Text className="text-xl">
                {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
              </Text>
              <Text>·</Text>
              <View className="flex flex-row items-center space-x-1">
                <Star size={20} className="text-black dark:text-white" />
                <Text className="pt-1">{spot.rating._avg.rating?.toFixed(1)}</Text>
              </View>
            </View>
            {/* {user && (
              <LinkButton variant="secondary" to="reviews/new">
                Add review
              </LinkButton>
            )} */}
          </View>
          <View>
            {spot.reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

function ImageCarousel({ images }: { images: Pick<SpotImage, "id" | "path">[] }) {
  const [imageIndex, setImageIndex] = React.useState(0)

  if (images.length === 0) return <View className="h-[300px w-full bg-gray-100 dark:bg-gray-700" />
  return (
    <View className="w-full">
      <Carousel
        loop
        width={width}
        height={300}
        onSnapToItem={setImageIndex}
        data={images}
        renderItem={({ item: image }) => (
          <Image key={image.id} source={{ uri: createImageUrl(image.path) }} className="h-[300px] w-full object-cover" />
        )}
      />
      <View className="absolute bottom-2 right-2 rounded bg-gray-800/70 p-1">
        <Text className="text-xs text-white">{`${imageIndex + 1}/${images.length}`}</Text>
      </View>
    </View>
  )
}

function SpotLoading() {
  return (
    <View>
      <Skeleton className="h-[300px] w-full" />
      <View className="space-y-4 p-4">
        <View className="space-y-2">
          <View className="flex flex-row items-center space-x-1">
            <Skeleton className="sq-5 rounded-full" />
            <Skeleton className="h-[20px] w-[80px]" />
            <Skeleton className="h-[20px] w-[120px]" />
          </View>
          <Skeleton className="h-[60px] w-11/12" />
          <View className="flex flex-row items-center space-x-1">
            <Skeleton className="sq-5 rounded-full" />
            <Skeleton className="h-[20px] w-7" />
            <Skeleton className="h-[20px] w-[80px]" />
          </View>
          <View />
          <Skeleton className="h-px w-full" />
          <View />
          <Skeleton className="h-[500px] w-full" />
        </View>
      </View>
    </View>
  )
}

function Skeleton(props: ViewProps) {
  return <View {...props} className={merge("rounded-lg bg-gray-100 dark:bg-gray-700", props.className)} />
}
