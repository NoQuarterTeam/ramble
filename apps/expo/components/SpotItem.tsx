import { createImageUrl } from "@ramble/shared"
import { Image } from "expo-image"
import { Link } from "expo-router"
import { Camera } from "lucide-react-native"

import { View } from "react-native"
import { RouterOutputs } from "../lib/api"
import { Text } from "./Text"

interface Props {
  spot: RouterOutputs["spot"]["latest"][number]
}

export function SpotItem({ spot }: Props) {
  return (
    <Link href={`/spots/${spot.id}`} className="mb-2">
      <View className="flex w-full flex-row items-center justify-start space-x-2">
        <View className="h-[100px] w-[100px]">
          {spot.images.length > 0 ? (
            <Image
              className="h-full w-full rounded-md bg-gray-50 object-cover dark:bg-gray-700"
              source={{ uri: createImageUrl(spot.images[0]?.path) }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-50 object-cover dark:bg-gray-700">
              <Camera className="opacity-50" />
            </div>
          )}
        </View>

        <View className="flex-shrink">
          <Text numberOfLines={2} className="text-lg">
            {spot.name}
          </Text>
          {/* {spot.rating && (
					<View className="flex space-x-1">
					<Star className="sq-5" />
					<p>{spot.rating === null ? "Not rated" : spot.rating}</p>
          </View>
        )} */}
          <Text numberOfLines={1} className="text-sm font-thin opacity-70">
            {spot.address}
          </Text>
        </View>
      </View>
    </Link>
  )
}
