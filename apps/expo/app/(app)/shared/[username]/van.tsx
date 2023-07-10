import { View } from "react-native"
import { Image } from "expo-image"

import { createImageUrl } from "@ramble/shared"

import { Spinner } from "../../../../components/ui/Spinner"
import { Text } from "../../../../components/ui/Text"
import { api } from "../../../../lib/api"
import { useParams } from "../../../router"

export function UserVan() {
  const { params } = useParams<"UserScreen">()

  const { data: van, isLoading } = api.van.byUser.useQuery({ username: params.username || "" }, { enabled: !!params.username })

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
      <Text>{van.description}</Text>
      {van.images.map((image) => (
        <Image
          key={image.id}
          className="min-h-[300px] w-full rounded-md object-contain"
          source={{ uri: createImageUrl(image.path) }}
        />
      ))}
    </View>
  )
}
