import * as React from "react"
import { ScrollView, View } from "react-native"
import { Check, Dog } from "lucide-react-native"

import { AMENITIES } from "@ramble/shared"

import { Icon } from "../../../../../components/Icon"
import { SpotIcon } from "../../../../../components/SpotIcon"
import { Button } from "../../../../../components/ui/Button"
import { SpotImageCarousel } from "../../../../../components/ui/SpotImageCarousel"
import { Text } from "../../../../../components/ui/Text"
import { toast } from "../../../../../components/ui/Toast"
import { api } from "../../../../../lib/api"
import { width } from "../../../../../lib/device"
import { useS3Upload } from "../../../../../lib/hooks/useS3"
import { AMENITIES_ICONS } from "../../../../../lib/models/amenities"
import { useParams, useRouter } from "../../../../router"
import { EditSpotModalView } from "./EditSpotModalView"

export function EditSpotConfirmScreen() {
  const { params } = useParams<"EditSpotConfirmScreen">()
  const router = useRouter()

  const utils = api.useUtils()
  const {
    mutate,
    isLoading: updateLoading,
    error,
  } = api.spot.update.useMutation({
    onSuccess: (data) => {
      utils.spot.list.refetch({ skip: 0, sort: "latest" })
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
    const imagesToUpload: string[] = []
    const existingImages: string[] = []
    for (const image of params.images) {
      if (image.startsWith("file://")) imagesToUpload.push(image)
      else existingImages.push(image)
    }
    const newImageKeys = await Promise.all(imagesToUpload.map((i) => upload(i)))
    mutate({
      id: params.id,
      description: params.description,
      name: params.name,
      latitude: params.latitude,
      longitude: params.longitude,
      type: params.type,
      images: [...newImageKeys, ...existingImages].map((i) => ({ path: i })),
      amenities: params.amenities,
      isPetFriendly: params.isPetFriendly,
    })
  }

  return (
    <EditSpotModalView title="confirm">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
        <View className="space-y-3">
          <View className="flex h-[50px] flex-row items-center space-x-2">
            <View className="sq-12 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
              <SpotIcon size={20} type={params.type} />
            </View>
            <Text numberOfLines={2} className="text-lg leading-6">
              {params.name}
            </Text>
          </View>
          {params.images.length > 0 && (
            <View className="rounded-xs overflow-hidden">
              <SpotImageCarousel
                width={width - 32}
                height={200}
                images={params.images.map((path) => ({ path, blurHash: null }))}
              />
            </View>
          )}

          <Text>{params.description}</Text>
          {params.isPetFriendly && (
            <View className="flex flex-row items-center space-x-2">
              <Icon icon={Dog} size={20} />
              <Text>Pet friendly</Text>
            </View>
          )}
          {params.amenities && (
            <View className="flex flex-row flex-wrap gap-2">
              {Object.entries(AMENITIES).map(([key, value]) => {
                if (!params.amenities?.[key as keyof typeof AMENITIES]) return null
                const icon = AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]
                return (
                  <View key={key} className="rounded-xs flex flex-row space-x-1 border border-gray-200 p-2 dark:border-gray-700">
                    {icon && <Icon size={20} icon={icon} />}
                    <Text className="text-sm">{value}</Text>
                  </View>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-12 left-4 right-4 flex items-center justify-center space-y-2">
        {error && <Text className="text-red-500">{error.message}</Text>}
        <Button
          isLoading={updateLoading || isLoading}
          leftIcon={<Icon icon={Check} size={20} color={{ light: "white", dark: "black" }} />}
          className="rounded-full"
          onPress={handleCreateSpot}
        >
          Update
        </Button>
      </View>
    </EditSpotModalView>
  )
}
