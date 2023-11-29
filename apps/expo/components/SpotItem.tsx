import { TouchableOpacity, View } from "react-native"
import { Heart, Star } from "lucide-react-native"

import { type SpotItemWithStatsAndImage } from "@ramble/shared"
import { createImageUrl, displayRating } from "@ramble/shared"

import { useRouter } from "../app/router"
import { Icon } from "./Icon"
import { SpotIcon } from "./SpotIcon"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"
import { api } from "../lib/api"

interface Props {
  spot: SpotItemWithStatsAndImage
}

export function SpotItem({ spot }: Props) {
  const { push } = useRouter()
  const utils = api.useUtils()

  return (
    <TouchableOpacity
      onPressIn={() => {
        void utils.spot.detail.prefetch({ id: spot.id })
      }}
      className="w-full"
      onPress={() => push("SpotDetailScreen", { id: spot.id })}
      activeOpacity={0.8}
    >
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
              <SpotIcon type={spot.type} size={40} />
            </View>
          </View>
        )}
        {spot.image && (
          <View className="sq-10 bg-background dark:bg-background-dark absolute left-2 top-2 flex items-center justify-center rounded-full">
            <SpotIcon type={spot.type} size={20} />
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
            <Icon icon={Star} size={16} />
            <Text className="text-sm">{displayRating(spot.rating)}</Text>
          </View>
          <View className="flex flex-row flex-wrap items-center space-x-1">
            <Icon icon={Heart} size={16} />
            <Text className="text-sm">{spot.savedCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}
