import { FlashList } from "@shopify/flash-list"
import { useLocalSearchParams } from "expo-router"
import { Heart, Lock } from "lucide-react-native"
import { usePostHog } from "posthog-react-native"
import * as React from "react"
import { TouchableOpacity, View, useColorScheme } from "react-native"

import { Icon } from "~/components/Icon"
import { SignupCta } from "~/components/SignupCta"
import { ModalView } from "~/components/ui/ModalView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { type RouterOutputs, api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"

export default function SaveSpotToListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { me } = useMe()
  const { data: lists, isLoading } = api.list.allByUserWithSavedSpots.useQuery({ spotId: id }, { enabled: !!me })
  if (!me)
    return (
      <ModalView title="save to list">
        <SignupCta text="Sign up to start saving spots" />
      </ModalView>
    )
  return (
    <ModalView title="save to list">
      {isLoading ? (
        <View className="flex flex-row items-center justify-center pt-6">
          <Spinner />
        </View>
      ) : (
        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={100}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={<Text>No lists yet</Text>}
          data={lists || []}
          ItemSeparatorComponent={() => <View className="h-1" />}
          renderItem={({ item }) => <SaveableListItem spotId={id} list={item} />}
        />
      )}
    </ModalView>
  )
}

interface Props {
  spotId: string
  list: RouterOutputs["list"]["allByUserWithSavedSpots"][number]
}

function SaveableListItem({ list, spotId }: Props) {
  const foundSavedItem = list.listSpots.some((s) => s.spotId === spotId)

  const [isSaved, setIsSaved] = React.useState(foundSavedItem)
  const utils = api.useUtils()

  React.useEffect(() => {
    setIsSaved(foundSavedItem)
  }, [foundSavedItem])

  const posthog = usePostHog()
  const { mutate } = api.list.saveToList.useMutation({
    onSuccess: () => {
      if (foundSavedItem) {
        posthog.capture("spot removed from list", { spotId, listId: list.id })
      } else {
        posthog.capture("spot saved to list", { spotId, listId: list.id })
      }
      void utils.list.allByUserWithSavedSpots.refetch()
      void utils.list.detail.refetch()
      void utils.list.spotClusters.refetch()
      void utils.spot.detail.refetch({ id: spotId })
      void utils.spot.mapPreview.refetch({ id: spotId })
    },
  })
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const handleToggle = () => {
    setIsSaved((s) => !s)
    mutate({ listId: list.id, spotId })
  }

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.8}
      className="flex flex-row items-center justify-between rounded-xs border border-gray-100 p-4 dark:border-gray-700"
    >
      <View>
        <View className="flex flex-row items-center space-x-2">
          {list.isPrivate && <Icon icon={Lock} size={20} />}
          <Text className="text-xl">{list.name}</Text>
        </View>
        <Text className="text-base">{list.description}</Text>
      </View>
      <Icon icon={Heart} size={20} fill={isSaved ? (isDark ? "white" : "black") : "transparent"} />
    </TouchableOpacity>
  )
}
