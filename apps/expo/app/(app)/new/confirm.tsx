import * as React from "react"
import { Check, X } from "lucide-react-native"

import { Image } from "expo-image"
import { ScrollView, View } from "react-native"
import { Button } from "../../../components/ui/Button"
import { ScreenView } from "../../../components/ui/ScreenView"
import { Text } from "../../../components/ui/Text"
import { SPOTS } from "../../../lib/spots"
import { useParams, useRouter } from "../../router"
import { api } from "../../../lib/api"
import { toast } from "../../../components/ui/Toast"
import { useS3Upload } from "../../../lib/hooks/useS3"
import { AMENITIES } from "@ramble/shared"

export function NewSpotConfirmScreen() {
  const { params } = useParams<"NewSpotConfirmScreen">()
  const router = useRouter()
  const Icon = SPOTS[params.type].Icon
  const { mutate, isLoading: createLoading } = api.spot.create.useMutation({
    onSuccess: (data) => {
      router.navigate("SpotsMapScreen")
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
    <ScreenView
      title="Confirm"
      rightElement={
        <Button
          isLoading={createLoading || isLoading}
          variant="primary"
          size="sm"
          leftIcon={<Check size={20} className="text-white" />}
          className="rounded-full"
          onPress={handleCreateSpot}
        >
          Create
        </Button>
      }
    >
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
      <View className="absolute bottom-16 left-4 flex space-y-2 right-4 items-center justify-center">
        <Button
          variant="secondary"
          leftIcon={<X size={20} className="text-black dark:text-white" />}
          className="rounded-full"
          size="sm"
          onPress={router.popToTop}
        >
          Cancel
        </Button>
      </View>
    </ScreenView>
  )
}
