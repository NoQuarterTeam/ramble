import * as React from "react"
import { ScrollView, Switch, View } from "react-native"
import { useGlobalSearchParams, useRouter } from "expo-router"
import { Check, Dog, Lock, MapPin } from "lucide-react-native"

import { type SpotType } from "@ramble/database/types"
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
}

export default function NewSpotConfirmScreen() {
  const { me } = useMe()
  const params = useGlobalSearchParams<Params>()
  const router = useRouter()
  const [shouldPublishLater, setShouldPublishLater] = React.useState(false)
  const utils = api.useUtils()

  const {
    mutate,
    isLoading: createLoading,
    error,
  } = api.spot.create.useMutation({
    onSuccess: async (data) => {
      utils.spot.list.refetch({ skip: 0, sort: "latest" })
      if (me?.role === "GUIDE") {
        router.navigate(`/(home)/(index)/spot/${data.id}`)
        toast({ title: "Spot created", message: "Thank you for contributing to the community!" })
      } else {
        router.navigate("/")
        toast({ title: "A guide will review your spot", message: "Thank you for contributing to the community!" })
      }
      await utils.user.hasCreatedSpot.refetch()
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
    // upload images
    setLoading(true)
    const images = params.images && (await Promise.all(params.images.split(",").map((i) => upload(i))))
    if (!params.name || !params.type) return toast({ title: "Name is required", type: "error" })
    console.log(parsedAmenities)

    mutate({
      description: params.description,
      name: params.name,
      latitude: Number(params.latitude),
      longitude: Number(params.longitude),
      address: params.address,
      isPetFriendly: params.isPetFriendly === "true",
      type: params.type,
      images: images ? images.map((i) => ({ path: i })) : [],
      amenities: parsedAmenities || undefined,
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
            <View className="rounded-xs overflow-hidden">
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
                  <View key={key} className="rounded-xs flex flex-row space-x-1 border border-gray-200 p-2 dark:border-gray-700">
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

      <View className="absolute bottom-12 left-4 right-4 flex items-center justify-center space-y-2">
        <FormError error={error} />
        <Button
          isLoading={createLoading || isLoading}
          leftIcon={<Icon icon={Check} size={20} color={{ light: "white", dark: "black" }} />}
          className="rounded-full"
          onPress={handleCreateSpot}
        >
          Create
        </Button>
      </View>
    </NewSpotModalView>
  )
}
