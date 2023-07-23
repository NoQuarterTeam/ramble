import * as React from "react"
import { ScrollView, View } from "react-native"
import { Image } from "expo-image"
import { Check } from "lucide-react-native"

import { AMENITIES } from "@ramble/shared"

import { Button } from "../../../../../components/ui/Button"
import { Text } from "../../../../../components/ui/Text"
import { toast } from "../../../../../components/ui/Toast"
import { api } from "../../../../../lib/api"
import { useS3Upload } from "../../../../../lib/hooks/useS3"
import { SPOTS } from "../../../../../lib/static/spots"
import { useParams, useRouter } from "../../../../router"
import { NewSpotModalView } from "./NewSpotModalView"

export function NewSpotConfirmScreen() {
  const { params } = useParams<"NewSpotConfirmScreen">()
  const router = useRouter()
  const Icon = SPOTS[params.type].Icon

  const utils = api.useContext()
  const { mutate, isLoading: createLoading } = api.spot.create.useMutation({
    onSuccess: (data) => {
      utils.spot.latest.refetch()

      router.navigate("AppLayout")
      router.navigate("SpotDetailScreen", { id: data.id })
      toast({ title: "Spot created!" })
    },
    onError: () => {
      setLoading(false)
    },
  })

  const [isLoading, setLoading] = React.useState(false)
  const [upload] = useS3Upload()

  const handleCreateSpot = async () => {
    // upload images
    setLoading(true)
    const images = await Promise.all(params.images.map((i) => upload(i)))
    mutate({
      description: params.info.description,
      name: params.info.name,
      latitude: params.location.latitude,
      longitude: params.location.longitude,
      type: params.type,
      images: images.map((i) => ({ path: i.key })),
      amenities: params.amenities,
      isPetFriendly: params.info.isPetFriendly,
    })
  }

  return (
    <NewSpotModalView title="Confirm">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}>
        <View className="space-y-2">
          <Icon className="text-black dark:text-white" />
          <Text>{params.info.name}</Text>
          <Text>{params.info.description}</Text>
          {params.info.isPetFriendly && <Text>Pet friendly</Text>}
          {params.amenities &&
            Object.keys(params.amenities).map((key) => <Text key={key}>{AMENITIES[key as keyof typeof AMENITIES]}</Text>)}
          <View className="flex flex-row flex-wrap">
            {params.images.map((image, i) => (
              <View key={i} className="p-1 w-1/3">
                <Image className="h-[100px] w-full rounded-md bg-gray-50 object-cover dark:bg-gray-700" source={{ uri: image }} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-12 left-4 flex space-y-2 right-4 items-center justify-center">
        <Button
          isLoading={createLoading || isLoading}
          leftIcon={<Check size={20} className="text-white dark:text-black" />}
          className="rounded-full"
          onPress={handleCreateSpot}
        >
          Create
        </Button>
      </View>
    </NewSpotModalView>
  )
}
