import { FlashList } from "@shopify/flash-list"
import { useLocalSearchParams } from "expo-router"
import { Heart } from "lucide-react-native"
import * as React from "react"
import { TouchableOpacity, View, useColorScheme } from "react-native"

import { Icon } from "~/components/Icon"
import { SignupCta } from "~/components/SignupCta"
import { ModalView } from "~/components/ui/ModalView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { type RouterOutputs, api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"

export default function SaveSpotToTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { me } = useMe()
  const { data: trips, isLoading } = api.trip.allWithSavedSpot.useQuery({ spotId: id }, { enabled: !!me && !!id })
  if (!me)
    return (
      <ModalView title="add to trip">
        <SignupCta text="Sign up to start saving spots" />
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
  trip: RouterOutputs["trip"]["allWithSavedSpot"][number]
}

function SaveableTripItem({ trip, spotId }: Props) {
  const [isSaved, setIsSaved] = React.useState(trip.isSaved)
  const utils = api.useUtils()

  React.useEffect(() => {
    setIsSaved(trip.isSaved)
  }, [trip.isSaved])

  const { mutate } = api.trip.saveSpot.useMutation({
    onSuccess: () => {
      void utils.trip.detail.refetch({ id: trip.id })
      void utils.trip.allWithSavedSpot.refetch({ spotId })
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
      className="flex flex-row items-center justify-between rounded-xs border border-gray-100 p-4 dark:border-gray-700"
    >
      <View>
        <View className="flex flex-row items-center space-x-2">
          <Text className="text-xl">{trip.name}</Text>
        </View>
      </View>
      <Icon icon={Heart} size={20} fill={isSaved ? (isDark ? "white" : "black") : "transparent"} />
    </TouchableOpacity>
  )
}
