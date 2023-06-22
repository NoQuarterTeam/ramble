import { View } from "react-native"

import { Spinner } from "../../../../components/Spinner"
import { SpotItem } from "../../../../components/SpotItem"
import { Text } from "../../../../components/Text"
import { api } from "../../../../lib/api"
import { useParams } from "../../../router"

export function UsernameSpots() {
  const { params } = useParams<"UsernameLayout">()
  const { data: spots, isLoading } = api.spot.byUser.useQuery({ username: params.username })
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
