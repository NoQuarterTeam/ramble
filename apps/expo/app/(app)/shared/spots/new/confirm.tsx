import * as React from "react"
import { ScrollView, Switch, View } from "react-native"
import { Image } from "expo-image"
import { Check, Lock } from "lucide-react-native"

import { AMENITIES } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Button } from "../../../../../components/ui/Button"
import { Text } from "../../../../../components/ui/Text"
import { toast } from "../../../../../components/ui/Toast"
import { api } from "../../../../../lib/api"
import { useS3Upload } from "../../../../../lib/hooks/useS3"
import { SPOT_TYPES } from "../../../../../lib/static/spots"
import { useParams, useRouter } from "../../../../router"
import { NewSpotModalView } from "./NewSpotModalView"

export function NewSpotConfirmScreen() {
  const { params } = useParams<"NewSpotConfirmScreen">()
  const router = useRouter()
  const Icon = SPOT_TYPES[params.type].Icon
  const [shouldPublishLater, setShouldPublishLater] = React.useState(false)
  const utils = api.useContext()
  const {
    mutate,
    isLoading: createLoading,
    error,
  } = api.spot.create.useMutation({
    onSuccess: (data) => {
      utils.spot.list.refetch({ skip: 0, sort: "latest" })
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
      description: params.description,
      name: params.name,
      latitude: params.latitude,
      longitude: params.longitude,
      isPetFriendly: params.isPetFriendly,
      type: params.type,
      images: images.map((i) => ({ path: i })),
      amenities: params.amenities,
    })
  }

  return (
    <NewSpotModalView title="confirm">
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
                <Image className="rounded-xs h-[100px] w-full bg-gray-50 object-cover dark:bg-gray-700" source={{ uri: image }} />
              </View>
            ))}
          </View>
          <View className="flex w-full flex-row items-center justify-between px-4 py-2">
            <View className="flex flex-row items-center space-x-2">
              <Lock size={20} className="text-black dark:text-white" />
              <Text className="text-lg">Publish later</Text>
            </View>
            <Switch
              trackColor={{ true: colors.primary[600] }}
              value={shouldPublishLater}
              onValueChange={() => setShouldPublishLater((p) => !p)}
            />
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-12 left-4 right-4 flex items-center justify-center space-y-2">
        {error && <Text className="text-red-500">{error.message}</Text>}
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
