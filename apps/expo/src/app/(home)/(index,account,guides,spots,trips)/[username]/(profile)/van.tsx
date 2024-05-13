import { useLocalSearchParams } from "expo-router"
import { View } from "react-native"

import { createAssetUrl } from "@ramble/shared"

import { Bike, ShowerHead, Wifi, Zap } from "lucide-react-native"
import { Icon } from "~/components/Icon"
import { Icons } from "~/components/ui/Icons"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { isTablet } from "~/lib/device"

export default function UserVan() {
  const params = useLocalSearchParams<{ username: string }>()

  const { data: van, isLoading } = api.van.byUser.useQuery(
    { username: params.username?.toLowerCase().trim() || "" },
    { enabled: !!params.username },
  )

  if (isLoading)
    return (
      <View className="flex items-center justify-center py-4">
        <Spinner />
      </View>
    )

  if (!van)
    return (
      <View className="flex items-center justify-center py-4">
        <Text>No van yet</Text>
      </View>
    )

  return (
    <View className="space-y-2 py-2">
      <View>
        <Text className="text-3xl">{van.name}</Text>
        <View className="flex flex-row items-center space-x-1">
          <Text className="opacity-75">{van.model}</Text>
          <Text className="opacity-75">·</Text>
          <Text className="opacity-75">{van.year}</Text>
        </View>
      </View>
      <Text className="text-base">{van.description}</Text>
      <View className="flex flex-row flex-wrap gap-1">
        {van.hasShower && (
          <View className="p-2 rounded-sm border border-gray-200 dark:border-gray-700">
            <Icon icon={ShowerHead} size={20} />
          </View>
        )}
        {van.hasToilet && (
          <View className="p-2 rounded-sm border border-gray-200 dark:border-gray-700">
            <Icon icon={Icons.Toilet} size={20} />
          </View>
        )}
        {van.hasElectricity && (
          <View className="p-2 rounded-sm border border-gray-200 dark:border-gray-700">
            <Icon icon={Zap} size={20} />
          </View>
        )}
        {van.hasInternet && (
          <View className="p-2 rounded-sm border border-gray-200 dark:border-gray-700">
            <Icon icon={Wifi} size={20} />
          </View>
        )}
        {van.hasBikeRack && (
          <View className="p-2 rounded-sm border border-gray-200 dark:border-gray-700">
            <Icon icon={Bike} size={20} />
          </View>
        )}
      </View>

      {van.images.map((image) => (
        <OptimizedImage
          key={image.id}
          width={500}
          height={300}
          placeholder={image.blurHash}
          style={{ width: isTablet ? "48%" : "100%", marginHorizontal: isTablet ? 10 : 0, marginBottom: 10 }}
          className="h-[300px] rounded-sm object-cover"
          source={{ uri: createAssetUrl(image.path) }}
        />
      ))}
    </View>
  )
}
