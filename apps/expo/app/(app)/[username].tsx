import { TouchableOpacity, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Updates from "expo-updates"
import { useQueryClient } from "@tanstack/react-query"
import Constants from "expo-constants"

import { Button } from "../../components/Button"
import { Heading } from "../../components/Heading"
import { Link } from "../../components/Link"
import { Text } from "../../components/Text"
import { api, AUTH_TOKEN } from "../../lib/api"
import { useLocalSearchParams, useRouter } from "expo-router"
import { EXPO_PROFILE_TAB_ID, VERSION } from "../../lib/config"
import { Spinner } from "../../components/Spinner"

const updateId = Updates.updateId
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateGroup = (Constants.manifest2?.metadata as any)?.["updateGroup"]

export default function Profile() {
  const { username } = useLocalSearchParams<{ username: string }>()

  console.log({ profile: username })
  const { data: user, isLoading: isLoadingUser } = api.user.byUsername.useQuery(
    { username: username as string },
    { enabled: !!username && username !== EXPO_PROFILE_TAB_ID },
  )

  // const { data: me, isLoading } = api.auth.me.useQuery()
  const utils = api.useContext()
  const client = useQueryClient()
  const router = useRouter()
  const handleLogout = async () => {
    router.push({ pathname: "/[username]", params: { username: EXPO_PROFILE_TAB_ID } })
    utils.auth.me.setData(undefined, null)
    await AsyncStorage.setItem(AUTH_TOKEN, "")
    client.clear()
  }

  return (
    <View className="px-4 py-20">
      <Heading className="text-3xl">Profile</Heading>
      {!!!username || username === EXPO_PROFILE_TAB_ID ? (
        <View className="space-y-10">
          <Text className="text-lg">Log in to start saving spots</Text>
          <View className="space-y-4">
            <Link asChild href={`/login?profile=true`}>
              <Button>Login</Button>
            </Link>
            <Link asChild href={`/register?profile=true`}>
              <TouchableOpacity>
                <Text className="text-lg">
                  Don't have an account yet? <Text className="text-lg underline">Sign up</Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      ) : isLoadingUser ? (
        <Spinner />
      ) : user ? (
        <View>
          <Text>{user.username}</Text>
          <Button onPress={handleLogout} variant="outline">
            Log out
          </Button>
        </View>
      ) : (
        <View>
          <Text>User not found</Text>
        </View>
      )}
      <View className="pt-10">
        <Text className="text-center">v{VERSION}</Text>
        <Text className="text-center opacity-60">{updateGroup?.split("-")[0] || updateId?.split("-")[0] || "dev"}</Text>
      </View>
    </View>
  )
}
