import { createAssetUrl } from "@ramble/shared"
import { FlashList } from "@shopify/flash-list"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { useLocalSearchParams } from "expo-router"
import { Heart, Lock } from "lucide-react-native"
import { usePostHog } from "posthog-react-native"
import * as React from "react"
import { TouchableOpacity, View, useColorScheme } from "react-native"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"

import { ModalView } from "~/components/ui/ModalView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { type RouterOutputs, api } from "~/lib/api"

export default function ChooseSpotCover() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: spot, isLoading } = api.spot.images.useQuery({ id })

  return (
    <ModalView title="choose cover">
      {isLoading ? (
        <View className="flex flex-row items-center justify-center pt-6">
          <Spinner />
        </View>
      ) : !spot ? null : (
        <ImageList spot={spot} />
      )}
    </ModalView>
  )
}

function ImageList({ spot }: { spot: NonNullable<RouterOutputs["spot"]["images"]> }) {
  const isDark = useColorScheme() === "dark"
  const [coverId, setCoverId] = React.useState(spot.coverId)
  const router = useRouter()
  const utils = api.useUtils()
  const { mutate, isLoading } = api.spot.update.useMutation({
    onSuccess: () => {
      utils.spot.detail.refetch({ id: spot.id })
      router.back()
    },
  })
  return (
    <View className="relative flex-1">
      <FlashList
        showsVerticalScrollIndicator={false}
        estimatedItemSize={120}
        numColumns={2}
        ListEmptyComponent={<Text>No images yet</Text>}
        data={spot?.images || []}
        extraData={coverId}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.8} className="relative w-full px-1" onPress={() => setCoverId(item.id)}>
            <Image className="rounded" source={{ uri: createAssetUrl(item.path) }} style={{ width: "100%", height: 120 }} />
            {item.id === coverId && (
              <View className="absolute top-1 left-2 flex items-center justify-center rounded-full bg-background p-1.5 dark:bg-background-dark">
                <Icon icon={Heart} size={18} fill={isDark ? "white" : "black"} />
              </View>
            )}
          </TouchableOpacity>
        )}
      />
      {coverId && (
        <View className="absolute right-0 bottom-8 left-0 flex items-center justify-center">
          <Button isLoading={isLoading} className="w-[100px] rounded-full" onPress={() => mutate({ id: spot.id, coverId })}>
            Save
          </Button>
        </View>
      )}
    </View>
  )
}
