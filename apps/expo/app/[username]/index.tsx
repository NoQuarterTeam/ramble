import { View } from "react-native"
import { useLocalSearchParams } from "expo-router"

import { Text } from "../../components/Text"

import { Spinner } from "../../components/Spinner"
import { SpotItem } from "../../components/SpotItem"
import { api } from "../../lib/api"

export default function ProfileSpots() {
  const { username } = useLocalSearchParams<{ username: string }>()
  const { data: spots, isLoading } = api.user.spots.useQuery({ username: username || "" }, { enabled: !!username })
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
    <View className="space-y-1">
      {spots.map((spot) => (
        <View key={spot.id}>
          <SpotItem spot={spot} />
        </View>
      ))}
    </View>
  )
}
