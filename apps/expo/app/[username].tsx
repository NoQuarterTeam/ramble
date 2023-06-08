import { View } from "react-native"
import { useLocalSearchParams } from "expo-router"

import { Text } from "../components/Text"
import { UserProfile } from "../components/UserProfile"

export default function PublicProfile() {
  const { username } = useLocalSearchParams<{ username: string }>()

  if (!username)
    return (
      <View className="px-4 py-20">
        <Text>User not found</Text>
      </View>
    )
  return <UserProfile username={username as string} />
}
