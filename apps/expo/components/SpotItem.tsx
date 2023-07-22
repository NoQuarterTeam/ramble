import { TouchableOpacity, View } from "react-native"
import { Camera, Star } from "lucide-react-native"

import { type SpotItemWithImageAndRating } from "@ramble/api/src/router/spot"
import { createImageUrl } from "@ramble/shared"

import { useRouter } from "../app/router"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"

interface Props {
  spot: SpotItemWithImageAndRating
}

export function SpotItem({ spot }: Props) {
  const { push } = useRouter()
  return (
    <TouchableOpacity onPress={() => push("SpotDetailScreen", { id: spot.id })} activeOpacity={0.8}>
      <View className="flex w-full flex-row items-center justify-start space-x-2">
        <View className="h-[100px] w-[100px]">
          {spot.image ? (
            <OptimizedImage
              width={100}
              placeholder={spot.blurHash}
              height={100}
              className="h-full w-full rounded-md bg-gray-50 object-cover dark:bg-gray-700"
              source={{ uri: createImageUrl(spot.image) }}
            />
          ) : (
            <View className="flex h-full w-full items-center justify-center rounded-md bg-gray-50 dark:bg-gray-700">
              <Camera className="opacity-50 text-black dark:text-white" />
            </View>
          )}
        </View>

        <View className="flex-shrink">
          <Text numberOfLines={2} className="text-base">
            {spot.name}
          </Text>

          <View className="flex flex-row items-center space-x-1">
            <Star className="text-black dark:text-white" size={16} />
            <Text>{spot.rating === null ? "Not rated" : spot.rating}</Text>
          </View>

          <Text numberOfLines={1} className="font-300 text-sm opacity-80">
            {spot.address}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
