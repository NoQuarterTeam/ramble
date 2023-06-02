import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import Carousel from "react-native-reanimated-carousel"
import { Image } from "expo-image"
import { useLocalSearchParams } from "expo-router"
import { BadgeX, ChevronLeft, Star, Verified } from "lucide-react-native"

import { createImageUrl } from "@ramble/shared"

import { Heading } from "../../../../components/Heading"
import { Link } from "../../../../components/Link"
import { RouterOutputs, api } from "../../../../lib/api"
import { width } from "../../../../lib/device"
import { SpotImage } from "@ramble/database/types"
import { Text } from "../../../../components/Text"
import { Button } from "../../../../components/Button"

export default function SpotDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data, isLoading } = api.spot.detail.useQuery({ id: id || "" }, { enabled: !!id })
  const spot = data

  if (isLoading) return null
  if (!spot)
    return (
      <View className="space-y-2 text-lg">
        <Text>Spot now found</Text>
        <Button>Back</Button>
      </View>
    )
  return (
    <ScrollView>
      <ImageCarousel images={spot.images} />

      <Link href=".." asChild className="absolute left-6 top-12">
        <TouchableOpacity
          activeOpacity={0.8}
          className="flex items-center justify-center rounded-lg bg-white p-1 dark:bg-gray-800"
        >
          <ChevronLeft className="pr-1 text-black dark:text-white" />
        </TouchableOpacity>
      </Link>
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

function ReviewItem({ review }: { review: RouterOutputs["spot"]["detail"]["reviews"][number] }) {
  return (
    <View className="space-y-2 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <View className="flex flex-row items-center space-x-2">
        <Star size={20} className="text-black dark:text-white" />
        <Text className="text-sm">5.0</Text>
      </View>
      <Text>{review.description}</Text>
    </View>
  )
}
