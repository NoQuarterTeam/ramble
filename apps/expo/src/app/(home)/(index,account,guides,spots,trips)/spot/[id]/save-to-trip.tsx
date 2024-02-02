import * as React from "react"
import { TouchableOpacity, useColorScheme, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useLocalSearchParams } from "expo-router"
import { Heart } from "lucide-react-native"

import { Icon } from "~/components/Icon"
import { LoginPlaceholder } from "~/components/LoginPlaceholder"
import { ModalView } from "~/components/ui/ModalView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api, type RouterOutputs } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"

export default function SaveSpotToTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { me } = useMe()
  const { data: trips, isLoading } = api.trip.mine.useQuery(undefined, { enabled: !!me })
  if (!me)
    return (
      <ModalView title="add to trip">
        <LoginPlaceholder text="Log in to start saving spots" />
      </ModalView>
    )
  return (
    <ModalView title="add to trip">
      {isLoading ? (
        <View className="flex flex-row items-center justify-center pt-6">
          <Spinner />
        </View>
      ) : (
        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={100}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={<Text>No trips yet</Text>}
          data={trips || []}
          ItemSeparatorComponent={() => <View className="h-1" />}
          renderItem={({ item }) => <SaveableTripItem spotId={id} trip={item} />}
        />
      )}
    </ModalView>
  )
}

interface Props {
  spotId: string
  trip: RouterOutputs["trip"]["mine"][number]
}

function SaveableTripItem({ trip, spotId }: Props) {
  const foundSavedItem = trip.items.some((ti) => ti.spotId === spotId)

  const [isSaved, setIsSaved] = React.useState(foundSavedItem)
  const utils = api.useUtils()

  React.useEffect(() => {
    setIsSaved(foundSavedItem)
  }, [foundSavedItem])

  const { mutate } = api.trip.saveSpot.useMutation({
    onSuccess: () => {
      void utils.trip.detail.refetch({ id: trip.id })
    },
  })
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const handleToggle = () => {
    setIsSaved((s) => !s)
    mutate({ tripId: trip.id, spotId })
  }

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.8}
      className="rounded-xs flex flex-row items-center justify-between border border-gray-100 p-4 dark:border-gray-700"
    >
      <View>
        <View className="flex flex-row items-center space-x-2">
          {/* {list.isPrivate && <Icon icon={Lock} size={20} />} */}
          <Text className="text-xl">{trip.name}</Text>
        </View>
        {/* <Text className="text-base">{trip.description}</Text> */}
      </View>
      <Icon icon={Heart} size={20} fill={isSaved ? (isDark ? "white" : "black") : "transparent"} />
    </TouchableOpacity>
  )
}
