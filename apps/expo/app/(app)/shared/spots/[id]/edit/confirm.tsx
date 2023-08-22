import * as React from "react"
import { ScrollView, View } from "react-native"
import { Image } from "expo-image"
import { Check } from "lucide-react-native"

import { AMENITIES } from "@ramble/shared"

import { Button } from "../../../../../../components/ui/Button"
import { Text } from "../../../../../../components/ui/Text"
import { toast } from "../../../../../../components/ui/Toast"
import { api } from "../../../../../../lib/api"
import { useS3Upload } from "../../../../../../lib/hooks/useS3"
import { SPOTS } from "../../../../../../lib/static/spots"
import { useParams, useRouter } from "../../../../../router"
import { EditSpotModalView } from "./EditSpotModalView"

export function EditSpotConfirmScreen() {
  const { params } = useParams<"EditSpotConfirmScreen">()
  const router = useRouter()
  const Icon = SPOTS[params.type].Icon

  const utils = api.useContext()
  const { mutate, isLoading: updateLoading } = api.spot.update.useMutation({
    onSuccess: (data) => {
      utils.spot.list.refetch({ sort: "latest", skip: 0 })
      utils.spot.detail.refetch({ id: data.id })
      router.navigate("AppLayout")
      router.navigate("SpotDetailScreen", { id: data.id })
      toast({ title: "Spot updated!" })
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
      id: params.id,
      description: params.description,
      name: params.name,
      latitude: params.latitude,
      longitude: params.longitude,
      type: params.type,
      images: images.map((i) => ({ path: i.key })),
      amenities: params.amenities,
      isPetFriendly: params.isPetFriendly,
    })
  }

  return (
    <EditSpotModalView title="Confirm">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}>
        <View className="space-y-2">
          <Icon className="text-black dark:text-white" />
          <Text>{params.name}</Text>
          <Text>{params.description}</Text>
          {params.isPetFriendly && <Text>Pet friendly</Text>}
          {params.amenities &&
            Object.keys(params.amenities).map((key) => <Text key={key}>{AMENITIES[key as keyof typeof AMENITIES]}</Text>)}
          <View className="flex flex-row flex-wrap">
            {params.images.map((image, i) => (
              <View key={i} className="w-1/3 p-1">
                <Image className="h-[100px] w-full rounded-md bg-gray-50 object-cover dark:bg-gray-700" source={{ uri: image }} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-12 left-4 right-4 flex items-center justify-center space-y-2">
        <Button
          isLoading={updateLoading || isLoading}
          leftIcon={<Check size={20} className="text-white dark:text-black" />}
          className="rounded-full"
          onPress={handleCreateSpot}
        >
          Update
        </Button>
      </View>
    </EditSpotModalView>
  )
}
