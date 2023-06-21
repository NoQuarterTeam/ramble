import { View } from "react-native"
import { Image } from "expo-image"
import { useLocalSearchParams } from "expo-router"

import { createImageUrl } from "@ramble/shared"

import { Spinner } from "../../../../components/Spinner"
import { Text } from "../../../../components/Text"
import { api } from "../../../../lib/api"

export function UsernameVan() {
  const { username } = useLocalSearchParams<{ username: string }>()

  const { data: van, isLoading } = api.user.van.useQuery({ username: username || "" }, { enabled: !!username })
  if (isLoading)
    return (
      <View className="flex items-center justify-center py-4">
        <Spinner />
      </View>
    )

  if (!van)
    return (
      <View className="flex items-end justify-center py-4">
        <Text>No van yet</Text>
      </View>
    )

  return (
    <View className="space-y-2">
      <Text className="text-2xl">{van.name}</Text>
      <Text>{van.model}</Text>
      <Text>{van.year}</Text>
      <Text>{van.description}</Text>
      {van.images.map((image) => (
        <Image key={image.id} className="h-[300px] w-full rounded-lg object-cover" source={{ uri: createImageUrl(image.path) }} />
      ))}
    </View>
  )
}
