import { ScrollView, TouchableOpacity, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { ChevronRight, type LucideIcon, ToggleRight, User, User2, AlertCircle } from "lucide-react-native"

import { createImageUrl } from "@ramble/shared"

import { LoginPlaceholder } from "../../../components/LoginPlaceholder"
import { Button } from "../../../components/ui/Button"
import { Heading } from "../../../components/ui/Heading"
import { Icons } from "../../../components/ui/Icons"
import { OptimizedImage } from "../../../components/ui/OptimisedImage"
import { TabView } from "../../../components/ui/TabView"
import { Text } from "../../../components/ui/Text"
import { api, AUTH_TOKEN } from "../../../lib/api"
import { UPDATE_ID, VERSION } from "../../../lib/config"
import { useMe } from "../../../lib/hooks/useMe"
import { type ScreenParamsList, useRouter } from "../../router"
import { toast } from "../../../components/ui/Toast"

export function ProfileScreen() {
  const { me } = useMe()
  const { push } = useRouter()
  const utils = api.useContext()

  const { mutate, data } = api.user.sendVerificationEmail.useMutation({
    onSuccess: () => {
      toast({ title: "Verification email sent" })
    },
  })

  const handleLogout = async () => {
    utils.user.me.setData(undefined, null)
    await AsyncStorage.removeItem(AUTH_TOKEN)
  }
  if (!me)
    return (
      <TabView title="Profile">
        <LoginPlaceholder text="Log in to start saving spots">
          <View className="space-y-4">
            <TouchableOpacity onPress={() => push("AuthLayout", { screen: "RegisterScreen" })}>
              <Text className="text-lg">
                Don't have an account yet? <Text className="text-lg underline">Sign up</Text>
              </Text>
            </TouchableOpacity>

            <View className="pt-10">
              <Text className="text-center">v{VERSION}</Text>
              <Text className="text-center opacity-60">{UPDATE_ID}</Text>
            </View>
          </View>
        </LoginPlaceholder>
      </TabView>
    )
  return (
    <TabView title="Profile">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} className="space-y-4 pt-2">
        {!me.isVerified && (
          <View className="flex flex-col space-y-3 rounded-md border border-gray-200 p-2 pl-4 dark:border-gray-700">
            <View className="flex flex-row items-center space-x-2">
              <AlertCircle size={20} className="text-black dark:text-white" />
              <Text className="text-lg">Your account is not yet verified</Text>
            </View>
            <Button onPress={() => mutate()} disabled={!!data} size="sm">
              Send verification email
            </Button>
          </View>
        )}
        <View>
          <View className="space-y-4">
            <TouchableOpacity
              onPress={() => push("UserScreen", { username: me.username })}
              className="flex flex-row items-center justify-between rounded-md border border-gray-200 p-4 dark:border-gray-700"
            >
              <View className="flex flex-row items-center space-x-4">
                {me.avatar ? (
                  <OptimizedImage
                    width={64}
                    height={64}
                    placeholder={me.avatarBlurHash}
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
          <Text className="text-center opacity-60">{UPDATE_ID}</Text>
        </View>
      </ScrollView>
    </TabView>
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
