import * as React from "react"
import { ScrollView, Switch, View } from "react-native"

import { Check, Dog, Lock } from "lucide-react-native"

import { AMENITIES } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Button } from "../../../../../components/ui/Button"
import { Text } from "../../../../../components/ui/Text"
import { toast } from "../../../../../components/ui/Toast"
import { api } from "../../../../../lib/api"
import { useS3Upload } from "../../../../../lib/hooks/useS3"

import { useParams, useRouter } from "../../../../router"
import { NewSpotModalView } from "./NewSpotModalView"
import { SpotIcon } from "../../../../../components/SpotIcon"
import { width } from "../../../../../lib/device"
import { SpotImageCarousel } from "../../../../../components/ui/SpotImageCarousel"
import { AMENITIES_ICONS } from "../../../../../lib/models/amenities"

export function NewSpotConfirmScreen() {
  const { params } = useParams<"NewSpotConfirmScreen">()
  const router = useRouter()
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
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
        <View className="space-y-3">
          <View className="flex h-[50px] flex-row items-center space-x-2">
            <View className="sq-12 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
              <SpotIcon size={20} type={params.type} className="text-black dark:text-white" />
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
              <Dog size={20} className="text-black dark:text-white" />
              <Text>Pet friendly</Text>
            </View>
          )}
          {params.amenities && (
            <View className="flex flex-row flex-wrap gap-2">
              {Object.entries(AMENITIES).map(([key, value]) => {
                if (!params.amenities?.[key as keyof typeof AMENITIES]) return null
                const Icon = AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]
                return (
                  <View key={key} className="rounded-xs flex flex-row space-x-1 border border-gray-200 p-2 dark:border-gray-700">
                    {Icon && <Icon size={20} className="text-black dark:text-white" />}
                    <Text className="text-sm">{value}</Text>
                  </View>
                )
              })}
            </View>
          )}
          <View className="flex w-full flex-row items-center justify-between px-4 py-2">
            <View className="flex flex-row items-center space-x-2">
              <Lock size={24} className="text-black dark:text-white" />
              <View>
                <Text className="text-lg">Publish later</Text>
                <Text className="text-xs">Will be public in 2 weeks</Text>
              </View>
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
