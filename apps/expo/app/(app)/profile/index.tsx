import { View } from "react-native"
import { Heading } from "../../../components/Heading"
import { AUTH_TOKEN, api } from "../../../lib/api"
import { Text } from "../../../components/Text"
import { Link } from "../../../components/Link"
import { useQueryClient } from "@tanstack/react-query"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Button } from "../../../components/Button"

export default function Profile() {
  const { data: me, isLoading } = api.auth.me.useQuery()
  const utils = api.useContext()
  const client = useQueryClient()
  const handleLogout = async () => {
    utils.auth.me.setData(undefined, null)
    await AsyncStorage.setItem(AUTH_TOKEN, "")
    client.clear()
  }
  return (
    <View>
      <Heading className="text-3xl">Profile</Heading>
      {isLoading ? null : me ? (
        <View>
          <Text>{me.username}</Text>
          <Button onPress={handleLogout} variant="outline">
            Log out
          </Button>
        </View>
      ) : (
        <View>
          <Link href="/login">Login</Link>
        </View>
      )}
    </View>
  )
}
