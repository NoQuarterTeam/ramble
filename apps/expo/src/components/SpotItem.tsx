import { TouchableOpacity, useColorScheme, View } from "react-native"
import { useRouter } from "expo-router"
import { Heart, Star } from "lucide-react-native"

import { createImageUrl, displayRating, displaySaved, type SpotItemType } from "@ramble/shared"

import { api } from "~/lib/api"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { Icon } from "./Icon"
import { SpotIcon } from "./SpotIcon"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"

interface Props {
  spot: SpotItemType
}

export function SpotItem({ spot }: Props) {
  const utils = api.useUtils()
  const router = useRouter()
  const tab = useTabSegment()
  const isDark = useColorScheme() === "dark"

  return (
    <TouchableOpacity
      onPressIn={() => {
        void utils.spot.detail.prefetch({ id: spot.id })
      }}
      className="w-full"
      onPress={() => router.push(`/${tab}/spot/${spot.id}`)}
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
        <View className="flex w-full flex-row items-center justify-between">
          <Text numberOfLines={1} className="font-500 flex-1 text-lg">
            {spot.name}
          </Text>
          <View className="flex flex-row items-center justify-end space-x-1.5 pl-1">
            {spot.savedCount && spot.savedCount !== "0" && (
              <View className="flex flex-row items-center space-x-1">
                <Icon icon={Heart} size={15} fill={isDark ? "white" : "black"} />
                <Text className="text-base">{displaySaved(spot.savedCount)}</Text>
              </View>
            )}
            {spot.rating && spot.rating !== "0" && (
              <View className="flex flex-row items-center space-x-1">
                <Icon icon={Star} size={16} fill={isDark ? "white" : "black"} />
                <Text className="text-base">{displayRating(spot.rating)}</Text>
              </View>
            )}
          </View>
        </View>
        {spot.address && (
          <Text numberOfLines={1} className="font-400 pb-0.5 text-sm opacity-80">
            {spot.address}
          </Text>
        )}
        {spot.distanceFromMe && <Text className="font-400 pb-0.5 text-sm opacity-80">{Math.round(spot.distanceFromMe)} km</Text>}
      </View>
    </TouchableOpacity>
  )
}
