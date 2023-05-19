import { View } from "react-native"

import { Text } from "../components/Text"
import { api } from "../lib/api"

export default function Home() {
  // const { data, isLoading } = api.auth.me.useQuery()
  const spots = api.spot.all.useQuery()
  // const router = useRouter()
  // const utils = api.useContext()
  // const client = useQueryClient()
  // const handleLogout = async () => {
  //   utils.auth.me.setData(undefined, null)
  //   await AsyncStorage.setItem(AUTH_TOKEN, "")
  //   client.clear()
  // }
  return (
    <View className="space-y-4 px-4 pt-20">
      {spots.data?.map((spot) => (
        <Text key={spot.id}>{spot.name}</Text>
      ))}
    </View>
  )
}
