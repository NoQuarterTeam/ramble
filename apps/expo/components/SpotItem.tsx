import { createImageUrl } from "@ramble/shared"
import { Image } from "expo-image"
import { Link } from "expo-router"
import { Camera, Star } from "lucide-react-native"

import { View } from "react-native"
import { RouterOutputs } from "../lib/api"
import { Text } from "./Text"

interface Props {
  spot: RouterOutputs["spot"]["latest"][number]
}

export function SpotItem({ spot }: Props) {
  return (
    <Link href={`/spots/${spot.id}`} className="mb-1">
      <View className="flex w-full flex-row items-center justify-start space-x-2">
        <View className="h-[110px] w-[110px]">
          {spot.image ? (
            <Image
              className="h-full w-full rounded-md bg-gray-50 object-cover dark:bg-gray-700"
              source={{ uri: createImageUrl(spot.image) }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-50 object-cover dark:bg-gray-700">
              <Camera className="opacity-50" />
            </div>
          )}
        </View>

        <View className="flex-shrink">
          <Text numberOfLines={2} className="text-base">
            {spot.name}
          </Text>

          <View className="flex flex-row space-x-1">
            <Star className="text-black dark:text-white" size={20} />
            <Text>{spot.rating === null ? "Not rated" : spot.rating}</Text>
          </View>

          <Text numberOfLines={1} className="font-300 text-sm opacity-80">
            {spot.address}
          </Text>
        </View>
      </View>
    </Link>
  )
}
