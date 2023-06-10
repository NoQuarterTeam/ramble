import Constants from "expo-constants"
import * as Updates from "expo-updates"
import { ScrollView, TouchableOpacity, View } from "react-native"

import { Button } from "../../../components/Button"
import { Heading } from "../../../components/Heading"
import { Link } from "../../../components/Link"

import { Text } from "../../../components/Text"
import { VERSION } from "../../../lib/config"
import { useMe } from "../../../lib/hooks/useMe"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { api, AUTH_TOKEN } from "../../../lib/api"

import { Image } from "expo-image"
import { createImageUrl } from "@ramble/shared"
import { LoginPlaceholder } from "../../../components/LoginPlaceholder"

const updateId = Updates.updateId
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateGroup = (Constants.manifest2?.metadata as any)?.["updateGroup"]

export default function Profile() {
  const { me } = useMe()
  const utils = api.useContext()
  const router = useRouter()
  const handleLogout = async () => {
    utils.auth.me.setData(undefined, null)
    await AsyncStorage.removeItem(AUTH_TOKEN)
    router.back()
  }
  if (!me)
    return (
      <LoginPlaceholder title="Account" text="Log in to start saving spots">
        <View className="space-y-4">
          <Link asChild href={`/register`}>
            <TouchableOpacity>
              <Text className="text-lg">
                Don't have an account yet? <Text className="text-lg underline">Sign up</Text>
              </Text>
            </TouchableOpacity>
          </Link>
          <View className="pt-10">
            <Text className="text-center">v{VERSION}</Text>
            <Text className="text-center opacity-60">{updateGroup?.split("-")[0] || updateId?.split("-")[0] || "dev"}</Text>
          </View>
        </View>
      </LoginPlaceholder>
    )
  return (
    <ScrollView className="min-h-full space-y-4 px-4 py-20">
      <Heading className="text-3xl">Account</Heading>
      <View>
        <View className="space-y-4">
          <Link href={`/${me.username}`}>
            <View className="flex flex-row items-center space-x-4">
              <Image
                source={{ uri: createImageUrl(me.avatar) }}
                className="sq-16 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
              />
              <View>
                <Heading className="text-2xl">{me.username}</Heading>
                <Text className="text-base">
                  {me.firstName} {me.lastName}
                </Text>
              </View>
            </View>
          </Link>
          <Link asChild href={`/${me.username}`}>
            <Button variant="outline">Show profile</Button>
          </Link>
          <Button onPress={handleLogout} variant="outline">
            Log out
          </Button>
        </View>
      </View>
      <View className="pt-10">
        <Text className="text-center">v{VERSION}</Text>
        <Text className="text-center opacity-60">{updateGroup?.split("-")[0] || updateId?.split("-")[0] || "dev"}</Text>
      </View>
    </ScrollView>
  )
}
