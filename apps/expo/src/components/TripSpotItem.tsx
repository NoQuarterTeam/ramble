import { TouchableOpacity, View } from "react-native"
import { useRouter } from "expo-router"

import { createImageUrl } from "@ramble/shared"

import { api } from "~/lib/api"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { SpotIcon } from "./SpotIcon"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"
import { Spot, SpotImage } from "@ramble/database/types"

interface Props {
  spot: Pick<Spot, "id" | "name" | "type"> & { images: Pick<SpotImage, "path" | "blurHash">[] }
}

export function TripSpotItem({ spot }: Props) {
  const utils = api.useUtils()
  const router = useRouter()
  const tab = useTabSegment()
  // const isDark = useColorScheme() === "dark"

  if (!spot) return null

  return (
    <TouchableOpacity
      onPressIn={() => {
        void utils.spot.detail.prefetch({ id: spot.id })
      }}
      className="h-full"
      onPress={() => router.push(`/${tab}/spot/${spot.id}`)}
      activeOpacity={0.8}
    >
      <View className="relative h-full w-[200px]">
        {spot.images && spot.images[0] ? (
          <OptimizedImage
            width={450}
            placeholder={spot.images[0].blurHash}
            height={300}
            className="h-full w-full rounded-md bg-gray-50 object-cover dark:bg-gray-800"
            source={{ uri: createImageUrl(spot.images[0].path) }}
          />
        ) : (
          <View className="rounded-xs flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-800">
            <View className="rounded-full p-4">
              <SpotIcon type={spot.type} size={30} />
            </View>
          </View>
        )}
        {spot.images && spot.images[0] && (
          <View className="sq-8 bg-background dark:bg-background-dark absolute left-2 top-2 flex items-center justify-center rounded-full">
            <SpotIcon type={spot.type} size={16} />
          </View>
        )}
        <View className="absolute bottom-1 left-2">
          <Text numberOfLines={1} className="font-700 text-md text-white opacity-80">
            {spot.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
