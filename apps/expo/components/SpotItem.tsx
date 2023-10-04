import { TouchableOpacity, View } from "react-native"
import { Heart, Star } from "lucide-react-native"

import { type SpotItemWithStatsAndImage } from "@ramble/shared"
import { createImageUrl, displayRating } from "@ramble/shared"

import { useRouter } from "../app/router"
import { SPOT_TYPES } from "../lib/static/spots"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"

interface Props {
  spot: SpotItemWithStatsAndImage
}

export function SpotItem({ spot }: Props) {
  const { push } = useRouter()
  const Icon = SPOT_TYPES[spot.type].Icon
  return (
    <TouchableOpacity onPress={() => push("SpotDetailScreen", { id: spot.id })} activeOpacity={0.8}>
      <View className="relative h-[250px] w-full">
        {spot.image ? (
          <OptimizedImage
            width={450}
            placeholder={spot.blurHash}
            height={300}
            className="rounded-xs h-full w-full bg-gray-50 object-cover dark:bg-gray-800"
            source={{ uri: createImageUrl(spot.image) }}
          />
        ) : (
          <View className="rounded-xs flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-800">
            <View className="rounded-full p-4">
              <Icon size={40} className="text-black dark:text-white" />
            </View>
          </View>
        )}
        {spot.image && (
          <View className="sq-10 bg-background dark:bg-background-dark absolute left-2 top-2 flex items-center justify-center rounded-full">
            <Icon size={20} className="text-black dark:text-white" />
          </View>
        )}
      </View>

      <View className="pt-1">
        <Text numberOfLines={2} className="text-xl">
          {spot.name}
        </Text>
        <Text numberOfLines={1} className="font-300 pb-0.5 text-sm opacity-80">
          {spot.address}
        </Text>
        <View className="flex flex-row items-center space-x-2">
          <View className="flex flex-row items-center space-x-1">
            <Star size={16} className="text-black dark:text-white" />
            <Text className="text-sm">{displayRating(spot.rating)}</Text>
          </View>
          <View className="flex flex-row flex-wrap items-center space-x-1">
            <Heart size={16} className="text-black dark:text-white" />
            <Text className="text-sm">{spot.savedCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}
