import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import Carousel from "react-native-reanimated-carousel"
import { Image } from "expo-image"
import { useLocalSearchParams } from "expo-router"
import { ChevronLeft } from "lucide-react-native"

import { createImageUrl } from "@ramble/shared"

import { Heading } from "../../../../components/Heading"
import { Link } from "../../../../components/Link"
import { api } from "../../../../lib/api"
import { width } from "../../../../lib/device"
import { SpotImage } from "@ramble/database/types"
import { Text } from "../../../../components/Text"

export default function SpotDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data } = api.spot.detail.useQuery({ id: id || "" }, { enabled: !!id })
  return (
    <View>
      <ImageCarousel images={data?.images || []} />

      <Link href=".." asChild className="absolute left-6 top-12">
        <TouchableOpacity
          activeOpacity={0.8}
          className="flex items-center justify-center rounded-lg bg-white p-1 dark:bg-gray-800"
        >
          <ChevronLeft className="pr-1 text-black dark:text-white" />
        </TouchableOpacity>
      </Link>
      <View className="p-4">
        <Heading className="text-2xl">{data?.name}</Heading>
      </View>
    </View>
  )
}

function ImageCarousel({ images }: { images: Pick<SpotImage, "id" | "path">[] }) {
  const [imageIndex, setImageIndex] = React.useState(0)

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
