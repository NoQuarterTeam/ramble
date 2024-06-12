import { useLocalSearchParams, useRouter } from "expo-router"
import { Check, Dog } from "lucide-react-native"
import * as React from "react"
import { ScrollView, View } from "react-native"

import type { SpotType } from "@ramble/database/types"
import { AMENITIES } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { SpotIcon } from "~/components/SpotIcon"
import { Button } from "~/components/ui/Button"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { width } from "~/lib/device"
import { useS3Upload } from "~/lib/hooks/useS3"
import { useTabSegment } from "~/lib/hooks/useTabSegment"
import { AMENITIES_ICONS } from "~/lib/models/amenities"

import { ImageCarousel } from "~/components/ui/ImageCarousel"
import { EditSpotModalView } from "./EditSpotModalView"

type Params = {
  id: string
  name: string
  description: string
  latitude: string
  longitude: string
  type: SpotType
  images: string
  amenities: string
  isPetFriendly: string
}

export default function EditSpotConfirmScreen() {
  const { id, ...params } = useLocalSearchParams<{ id: string } & Params>()
  const router = useRouter()
  const tab = useTabSegment()
  const utils = api.useUtils()
  const {
    mutate,
    isPending: updateLoading,
    error,
  } = api.spot.update.useMutation({
    onSuccess: async (data) => {
      utils.spot.list.refetch({ skip: 0, sort: "latest" })
      await utils.spot.detail.refetch({ id: data.id }).catch()
      router.navigate(`/${tab}/spot/${data.id}`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({ title: "Spot updated!" })
    },
    onError: () => {
      setLoading(false)
    },
  })

  const [isLoading, setLoading] = React.useState(false)
  const [upload] = useS3Upload()
  const amenities = params.amenities ? JSON.parse(params.amenities) : undefined

  const isPetFriendly = params.isPetFriendly === "true"
  const handleCreateSpot = async () => {
    // upload images
    setLoading(true)
    const imagesToUpload: string[] = []
    const existingImages: string[] = []
    for (const image of params.images.split(",")) {
      if (image.startsWith("file://")) imagesToUpload.push(image)
      else existingImages.push(image)
    }
    const newImageKeys = await Promise.all(imagesToUpload.map((i) => upload(i)))
    mutate({
      id,
      description: params.description || null,
      name: params.name,
      latitude: Number(params.latitude),
      longitude: Number(params.longitude),
      type: params.type,
      images: [...newImageKeys, ...existingImages].map((i) => ({ path: i })),
      amenities,
      isPetFriendly,
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
            <View className="overflow-hidden rounded-xs">
              <ImageCarousel width={width - 32} height={200} images={params.images.split(",")} />
            </View>
          )}

          <Text>{params.description}</Text>
          {isPetFriendly && (
            <View className="flex flex-row items-center space-x-2">
              <Icon icon={Dog} size={20} />
              <Text>Suitable for pets</Text>
            </View>
          )}
          {amenities && (
            <View className="flex flex-row flex-wrap gap-2">
              {Object.entries(AMENITIES).map(([key, value]) => {
                if (!amenities?.[key as keyof typeof AMENITIES]) return null
                const icon = AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]
                return (
                  <View key={key} className="flex flex-row space-x-1 rounded-xs border border-gray-200 p-2 dark:border-gray-700">
                    {icon && <Icon size={20} icon={icon} />}
                    <Text className="text-sm">{value}</Text>
                  </View>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <View className="absolute right-4 bottom-12 left-4 flex items-center justify-center space-y-2">
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
