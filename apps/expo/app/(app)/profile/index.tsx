import { ScrollView, TouchableOpacity, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"
import { Image } from "expo-image"
import * as Updates from "expo-updates"
import { ChevronRight, type LucideIcon, ToggleRight, User, User2 } from "lucide-react-native"

import { createImageUrl } from "@ramble/shared"

import { LoginPlaceholder } from "../../../components/LoginPlaceholder"
import { Button } from "../../../components/ui/Button"
import { Heading } from "../../../components/ui/Heading"
import { Text } from "../../../components/ui/Text"
import { api, AUTH_TOKEN } from "../../../lib/api"
import { VERSION } from "../../../lib/config"
import { useMe } from "../../../lib/hooks/useMe"
import { type ScreenParamsList, useRouter } from "../../router"
import { Icons } from "../../../components/ui/Icons"

const updateId = Updates.updateId
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateGroup = (Constants.manifest2?.metadata as any)?.["updateGroup"]

export function ProfileScreen() {
  const { me } = useMe()
  const { push } = useRouter()
  const utils = api.useContext()

  const handleLogout = async () => {
    utils.user.me.setData(undefined, null)
    await AsyncStorage.removeItem(AUTH_TOKEN)
  }
  if (!me)
    return (
      <LoginPlaceholder title="Profile" text="Log in to start saving spots">
        <View className="space-y-4">
          <TouchableOpacity onPress={() => push("AuthLayout", { screen: "RegisterScreen" })}>
            <Text className="text-lg">
              Don't have an account yet? <Text className="text-lg underline">Sign up</Text>
            </Text>
          </TouchableOpacity>

          <View className="pt-10">
            <Text className="text-center">v{VERSION}</Text>
            <Text className="text-center opacity-60">{updateGroup?.split("-")[0] || updateId?.split("-")[0] || "dev"}</Text>
          </View>
        </View>
      </LoginPlaceholder>
    )
  return (
    <View className="flex-1 space-y-2 px-4 pt-20">
      <Heading className="text-3xl">Profile</Heading>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} className="space-y-4 pt-2">
        <View>
          <View className="space-y-4">
            <TouchableOpacity
              onPress={() => push("UserScreen", { username: me.username })}
              className="flex flex-row items-center justify-between rounded-md border border-gray-200 p-4 dark:border-gray-700"
            >
              <View className="flex flex-row items-center space-x-4">
                {me.avatar ? (
                  <Image
                    source={{ uri: createImageUrl(me.avatar) }}
                    className="sq-16 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
                  />
                ) : (
                  <View className="sq-16 flex items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
                    <User2 className="text-black dark:text-white" />
                  </View>
                )}
                <View>
                  <Heading className="text-2xl">{me.username}</Heading>
                  <Text className="text-base">
                    {me.firstName} {me.lastName}
                  </Text>
                </View>
              </View>
              <View>
                <ChevronRight className="text-gray-700 dark:text-white" />
              </View>
            </TouchableOpacity>

            <View>
              <ProfileLink to="AccountScreen" Icon={User}>
                Account
              </ProfileLink>
              <ProfileLink to="InterestsScreen" Icon={ToggleRight}>
                Interests
              </ProfileLink>
              <ProfileLink to="VanScreen" Icon={Icons.Van}>
                Van
              </ProfileLink>
            </View>
          </View>
        </View>
        <View className="pt-10">
          <Button onPress={handleLogout} variant="link">
            Log out
          </Button>
          <Text className="text-center">v{VERSION}</Text>
          <Text className="text-center opacity-60">{updateGroup?.split("-")[0] || updateId?.split("-")[0] || "dev"}</Text>
        </View>
      </ScrollView>
    </View>
  )
}

function ProfileLink({ children, to, Icon }: { to: keyof ScreenParamsList; children: string; Icon: LucideIcon }) {
  const { push } = useRouter()
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="mb-1 flex flex-row items-center justify-between rounded-md border border-gray-200 px-4 py-3 dark:border-gray-700"
      onPress={() => push(to)}
    >
      <View className="flex flex-row items-center space-x-2">
        <Icon size={16} className="text-black dark:text-white" />
        <Text>{children}</Text>
      </View>
      <ChevronRight className="text-gray-700 dark:text-white" />
    </TouchableOpacity>
  )
}
