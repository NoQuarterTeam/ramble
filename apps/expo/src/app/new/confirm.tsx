import { useLocalSearchParams, useRouter } from "expo-router"
import { Check, Dog, Lock, MapPin } from "lucide-react-native"
import { usePostHog } from "posthog-react-native"
import * as React from "react"
import { ScrollView, Switch, View } from "react-native"

import type { SpotType } from "@ramble/database/types"
import { AMENITIES } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "~/components/Icon"
import { SpotIcon } from "~/components/SpotIcon"
import { Button } from "~/components/ui/Button"
import { FormError } from "~/components/ui/FormError"
import { SpotImageCarousel } from "~/components/ui/SpotImageCarousel"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { width } from "~/lib/device"
import { useMe } from "~/lib/hooks/useMe"
import { useS3Upload } from "~/lib/hooks/useS3"
import { AMENITIES_ICONS } from "~/lib/models/amenities"

import { NewSpotModalView } from "./NewSpotModalView"

type Params = {
  name?: string
  description?: string
  latitude?: string
  longitude?: string
  address?: string
  type?: SpotType
  isPetFriendly?: string
  images?: string
  amenities?: string
  tripId?: string
  order?: string
  googlePlaceId?: string
}

export default function NewSpotConfirmScreen() {
  const { me } = useMe()
  const params = useLocalSearchParams<Params>()
  const router = useRouter()
  const [shouldPublishLater, setShouldPublishLater] = React.useState(false)
  const utils = api.useUtils()
  const posthog = usePostHog()

  const {
    mutate,
    isLoading: createLoading,
    error,
  } = api.spot.create.useMutation({
    onSuccess: async (data) => {
      posthog.capture("spot created", { type: data.type })
      await utils.user.hasCreatedSpot.refetch()
      if (params.tripId) {
        await utils.trip.detail.refetch({ id: params.tripId })
        router.navigate(`/(home)/(trips)/trips/${params.tripId}`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        toast({ title: "Spot created", message: "Thank you for contributing to the community!" })
      } else {
        if (me?.role === "GUIDE") {
          void utils.spot.list.refetch({ skip: 0, sort: "latest" })
          router.navigate(`/(home)/(index)/spot/${data.id}`)
          await new Promise((resolve) => setTimeout(resolve, 1000))
          toast({ title: "Spot created", message: "Thank you for contributing to the community!" })
        } else {
          router.navigate("/")
          await new Promise((resolve) => setTimeout(resolve, 1000))
          toast({ title: "A guide will review your spot", message: "Thank you for contributing to the community!" })
        }
      }
    },
    onError: () => {
      setLoading(false)
    },
  })

  const parsedAmenities = React.useMemo(() => {
    if (!params.amenities) return null
    return JSON.parse(params.amenities)
  }, [params.amenities])

  const [isLoading, setLoading] = React.useState(false)
  const [upload] = useS3Upload()

  const handleCreateSpot = async () => {
    setLoading(true)
    if (!params.name || !params.type) return toast({ title: "Name is required", type: "error" })
    // upload images, but only the ones uploading from local library
    const images = params.images ? params.images.split(",") : []
    const userImages = images.filter((image) => !image.startsWith("http"))
    const googleImages = images.filter((image) => image.startsWith("http"))
    const uploadedImages = await Promise.all(userImages.map(upload))

    mutate({
      description: params.description,
      name: params.name,
      latitude: Number(params.latitude),
      longitude: Number(params.longitude),
      address: params.address,
      isPetFriendly: params.isPetFriendly === "true",
      type: params.type,
      images: [...googleImages, ...uploadedImages].map((i) => ({ path: i })),
      amenities: parsedAmenities || undefined,
      tripId: params.tripId,
      order: params.order ? Number(params.order) : undefined,
      googlePlaceId: params.googlePlaceId,
    })
  }

  return (
    <NewSpotModalView title="confirm">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
        <View className="space-y-3">
          <View className="flex h-[50px] flex-row items-center space-x-2">
            {params.type && (
              <View className="sq-12 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
                <SpotIcon size={20} type={params.type} />
              </View>
            )}
            <Text numberOfLines={2} className="text-lg leading-6">
              {params.name}
            </Text>
          </View>
          {params.images && params.images.length > 0 && (
            <View className="overflow-hidden rounded-xs">
              <SpotImageCarousel
                width={width - 32}
                height={200}
                images={params.images.split(",").map((path) => ({ path, blurHash: null }))}
              />
            </View>
          )}

          <Text>{params.description}</Text>
          <View className="flex flex-row items-center space-x-2">
            <Icon icon={MapPin} size={20} />
            <Text>{params.address}</Text>
          </View>
          {params.isPetFriendly && (
            <View className="flex flex-row items-center space-x-2">
              <Icon icon={Dog} size={20} />
              <Text>Pet friendly</Text>
            </View>
          )}
          {parsedAmenities && (
            <View className="flex flex-row flex-wrap gap-2">
              {Object.entries(AMENITIES).map(([key, value]) => {
                if (!parsedAmenities?.[key as keyof typeof AMENITIES]) return null
                const icon = AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]
                return (
                  <View key={key} className="flex flex-row space-x-1 rounded-xs border border-gray-200 p-2 dark:border-gray-700">
                    {icon && <Icon icon={icon} size={20} />}
                    <Text className="text-sm">{value}</Text>
                  </View>
                )
              })}
            </View>
          )}
          <View className="flex w-full flex-row items-center justify-between p-2">
            <View className="flex flex-row items-center space-x-2">
              <Icon icon={Lock} size={24} />
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

      <View className="absolute right-4 bottom-12 left-4 flex items-center justify-center space-y-2">
        <Button
          isLoading={createLoading || isLoading}
          leftIcon={<Icon icon={Check} size={20} color={{ light: "white", dark: "black" }} />}
          className="rounded-full"
          onPress={handleCreateSpot}
        >
          Create
        </Button>
        <FormError error={error} />
      </View>
    </NewSpotModalView>
  )
}
