import { TouchableOpacity, View } from "react-native"
import Constants from "expo-constants"
import * as Updates from "expo-updates"

import { Button } from "../../components/Button"
import { Heading } from "../../components/Heading"
import { Link } from "../../components/Link"
import { Spinner } from "../../components/Spinner"
import { Text } from "../../components/Text"
import { UserProfile } from "../../components/UserProfile"
import { api } from "../../lib/api"
import { VERSION } from "../../lib/config"

const updateId = Updates.updateId
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateGroup = (Constants.manifest2?.metadata as any)?.["updateGroup"]

export default function Profile() {
  const { data: me, isLoading } = api.auth.me.useQuery()

  if (isLoading)
    return (
      <View className="flex items-center justify-center py-20">
        <Spinner />
      </View>
    )

  // LOGGED OUT - PROFILE TAB
  if (!me)
    return (
      <View className="space-y-10 px-4 py-20">
        <View>
          <Heading className="text-3xl">Profile</Heading>
          <Text className="text-lg">Log in to start saving spots</Text>
        </View>
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
        <View className="pt-10">
          <Text className="text-center">v{VERSION}</Text>
          <Text className="text-center opacity-60">{updateGroup?.split("-")[0] || updateId?.split("-")[0] || "dev"}</Text>
        </View>
      </View>
    )

  return <UserProfile username={me.username} />
}
