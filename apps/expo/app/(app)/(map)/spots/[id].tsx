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

export default function SpotDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data } = api.spot.detail.useQuery({ id: id || "" }, { enabled: !!id })
  return (
    <View>
      <Carousel
        loop
        width={width}
        height={300}
        data={data?.images || []}
        renderItem={({ item: image }) => (
          <Image key={image.id} source={{ uri: createImageUrl(image.path) }} className="h-[300px] w-full object-cover" />
        )}
      />

      <Link href=".." asChild className="absolute left-6 top-12">
        <TouchableOpacity
          activeOpacity={0.8}
          className="flex items-center justify-center rounded-lg bg-white p-2 dark:bg-gray-800"
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
