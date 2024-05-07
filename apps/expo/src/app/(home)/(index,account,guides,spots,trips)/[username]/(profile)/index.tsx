import { useLocalSearchParams } from "expo-router"
import { View } from "react-native"

import { SpotItem } from "~/components/SpotItem"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"

export default function UserSpots() {
  const params = useLocalSearchParams<{ username: string }>()
  const { data: spots, isLoading } = api.spot.byUser.useQuery(
    { username: params.username?.toLowerCase().trim() },
    { staleTime: 30000, enabled: !!params.username },
  )
  if (isLoading)
    return (
      <View className="flex items-center justify-center py-4">
        <Spinner />
      </View>
    )

  if (!spots)
    return (
      <View className="flex items-end justify-center py-4">
        <Text>No spots found</Text>
      </View>
    )

  return (
    <View>
      {spots.map((spot) => (
        <View key={spot.id} style={{ paddingBottom: 24 }}>
          <SpotItem spot={spot} />
        </View>
      ))}
    </View>
  )
}
