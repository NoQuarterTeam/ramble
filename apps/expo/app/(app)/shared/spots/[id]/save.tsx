import { TouchableOpacity, useColorScheme, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { Heart, Lock } from "lucide-react-native"

import { LoginPlaceholder } from "../../../../../components/LoginPlaceholder"
import { ModalView } from "../../../../../components/ui/ModalView"
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
      {isLoading ? null : (
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
  const utils = api.useContext()
  const { mutate } = api.list.saveToList.useMutation({
    onSuccess: () => {
      utils.list.allByUserWithSavedSpots.refetch()
      utils.spot.detail.refetch({ id: spotId })
    },
  })
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const isSaved = list.listSpots.some((s) => s.spotId === spotId)

  const handleToggle = () => mutate({ listId: list.id, spotId })

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.8}
      className="rounded-xs flex flex-row items-center justify-between border border-gray-100 p-4 dark:border-gray-700"
    >
      <View>
        <View className="flex flex-row items-center space-x-2">
          {list.isPrivate && <Lock className="text-black dark:text-white" size={20} />}
          <Text className="text-xl">{list.name}</Text>
        </View>
        <Text className="text-base">{list.description}</Text>
      </View>
      <Heart size={20} className="text-black dark:text-white" fill={isSaved ? (isDark ? "white" : "black") : undefined} />
    </TouchableOpacity>
  )
}
