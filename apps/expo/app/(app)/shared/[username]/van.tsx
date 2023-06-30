import { View } from "react-native"
import { useLocalSearchParams } from "expo-router"

import { ImageCarousel } from "../../../../components/ui/ImageCarousel"
import { Spinner } from "../../../../components/ui/Spinner"
import { Text } from "../../../../components/ui/Text"
import { api } from "../../../../lib/api"
import { width } from "../../../../lib/device"

export function UsernameVan() {
  const { username } = useLocalSearchParams<{ username: string }>()

  const { data: van, isLoading } = api.van.byUser.useQuery({ username: username || "" }, { enabled: !!username })
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
      <Text className="text-3xl">{van.name}</Text>
      <View>
        <Text>{van.model}</Text>
        <Text>{van.year}</Text>
        <Text>{van.description}</Text>
      </View>
      {van.images.length > 0 && <ImageCarousel width={width - 16} height={300} images={van.images} imageClassName="rounded-md" />}
    </View>
  )
}
