import { ScrollView, TouchableOpacity, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  AlertCircle,
  ChevronRight,
  Cog,
  type LucideIcon,
  MessageCircle,
  ToggleRight,
  User,
  User2,
  UserPlus,
} from "lucide-react-native"

import { createImageUrl } from "@ramble/shared"

import { Icon } from "../../../components/Icon"
import { LoginPlaceholder } from "../../../components/LoginPlaceholder"
import { Button } from "../../../components/ui/Button"
import { Heading } from "../../../components/ui/Heading"
import { Icons } from "../../../components/ui/Icons"
import { OptimizedImage } from "../../../components/ui/OptimisedImage"
import { TabView } from "../../../components/ui/TabView"
import { Text } from "../../../components/ui/Text"
import { toast } from "../../../components/ui/Toast"
import { api, AUTH_TOKEN } from "../../../lib/api"
import { UPDATE_ID, VERSION } from "../../../lib/config"
import { useMe } from "../../../lib/hooks/useMe"
import { type ScreenParamsList, useRouter } from "../../router"

export function AccountScreen() {
  const { me } = useMe()
  const { push } = useRouter()
  const utils = api.useUtils()

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
      <TabView title="account">
        <LoginPlaceholder text="Log in to create your profile">
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
    <TabView title="account">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} className="space-y-4 pt-2">
        {!me.isVerified && (
          <View className="rounded-xs flex flex-col space-y-3 border border-gray-200 p-2 pl-4 dark:border-gray-700">
            <View className="flex flex-row items-center space-x-2">
              <Icon icon={AlertCircle} size={20} />
              <Text className="text-lg">Your account is not yet verified</Text>
            </View>
            <Text>Didn't receive an email?</Text>
            <Button onPress={() => mutate()} disabled={!!data} size="sm">
              Send verification email
            </Button>
          </View>
        )}
        <View>
          <View className="space-y-4">
            <TouchableOpacity
              onPress={() => push("UserScreen", { username: me.username })}
              className="rounded-xs flex flex-row items-center justify-between border border-gray-200 p-4 dark:border-gray-700"
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
                    <Icon icon={User2} />
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
                <Icon icon={ChevronRight} />
              </View>
            </TouchableOpacity>

            <View>
              <ProfileLink to="AccountInfoScreen" icon={User}>
                Info
              </ProfileLink>
              <ProfileLink to="AccountInterestsScreen" icon={ToggleRight}>
                Interests
              </ProfileLink>
              <ProfileLink to="AccountVanScreen" icon={Icons.Van}>
                Van
              </ProfileLink>
              <ProfileLink to="AccountInviteScreen" icon={UserPlus}>
                Invites
              </ProfileLink>
              <ProfileLink to="AccountSettingsScreen" icon={Cog}>
                Settings
              </ProfileLink>
              <ProfileLink to="AccountFeedbackScreen" icon={MessageCircle}>
                Feedback
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

function ProfileLink({ children, to, icon }: { to: keyof ScreenParamsList; children: string; icon: LucideIcon }) {
  const { push } = useRouter()
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="rounded-xs mb-1 flex flex-row items-center justify-between border border-gray-200 px-4 py-3 dark:border-gray-700"
      onPress={() => push(to)}
    >
      <View className="flex flex-row items-center space-x-2">
        <Icon icon={icon} size={16} />
        <Text>{children}</Text>
      </View>
      <Icon icon={ChevronRight} color={{ light: "gray", dark: "white" }} />
    </TouchableOpacity>
  )
}
