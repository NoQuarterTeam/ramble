import * as React from "react"
import { TouchableOpacity, useColorScheme, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { Heart, Lock } from "lucide-react-native"

import { Icon } from "../../../../../components/Icon"
import { LoginPlaceholder } from "../../../../../components/LoginPlaceholder"
import { ModalView } from "../../../../../components/ui/ModalView"
import { Spinner } from "../../../../../components/ui/Spinner"
import { Text } from "../../../../../components/ui/Text"
import { api, type RouterOutputs } from "../../../../../lib/api"
import { useMe } from "../../../../../lib/hooks/useMe"
import { useParams } from "../../../../router"

export function SaveSpotScreen() {
  const {
    params: { id },
  } = useParams<"SaveSpotScreen">()
  const { me } = useMe()
  const { data: lists, isLoading } = api.list.allByUserWithSavedSpots.useQuery({ spotId: id }, { enabled: !!me })
  if (!me)
    return (
      <ModalView title="save to list">
        <LoginPlaceholder text="Log in to start saving spots" />
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

  const { mutate } = api.list.saveToList.useMutation({
    onSuccess: () => {
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
      className="rounded-xs flex flex-row items-center justify-between border border-gray-100 p-4 dark:border-gray-700"
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
