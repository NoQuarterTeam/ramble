import AsyncStorage from "@react-native-async-storage/async-storage"
import { type AllRoutes, type Href, Link, useRouter } from "expo-router"
import {
  AlertCircle,
  ChevronRight,
  Heart,
  MessageCircle,
  Settings,
  ToggleRight,
  User,
  User2,
  UserPlus,
} from "lucide-react-native"
import { ScrollView, TouchableOpacity, View } from "react-native"

import { createAssetUrl } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { LoginPlaceholder } from "~/components/LoginPlaceholder"
import { Button } from "~/components/ui/Button"
import { Heading } from "~/components/ui/Heading"
import { Icons, type RambleIcon } from "~/components/ui/Icons"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { TabView } from "~/components/ui/TabView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { AUTH_TOKEN, api } from "~/lib/api"
import { IS_DEV, UPDATE_ID, VERSION } from "~/lib/config"
import { useMe } from "~/lib/hooks/useMe"

export default function AccountScreen() {
  const { me } = useMe()
  const router = useRouter()
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
            <Link push href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-lg">
                  Don't have an account yet? <Text className="text-lg underline">Sign up</Text>
                </Text>
              </TouchableOpacity>
            </Link>

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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} className="flex-1 space-y-4">
        {!me.isVerified && (
          <View className="flex flex-col space-y-3 rounded-xs border border-gray-200 p-2 pl-4 dark:border-gray-700">
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
            <Link push asChild href={`/(home)/(account)/${me.username}/(profile)`}>
              <TouchableOpacity className="flex flex-row items-center justify-between rounded-xs border border-gray-200 p-4 dark:border-gray-700">
                <View className="flex flex-row items-center space-x-4">
                  {me.avatar ? (
                    <OptimizedImage
                      width={64}
                      height={64}
                      placeholder={me.avatarBlurHash}
                      source={{ uri: createAssetUrl(me.avatar) }}
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
            </Link>

            <View>
              <ProfileLink to="info" icon={User}>
                Info
              </ProfileLink>
              <ProfileLink to="van" icon={Icons.Van}>
                Van
              </ProfileLink>
              <ProfileLink to="lists" icon={Heart}>
                Lists
              </ProfileLink>
              <ProfileLink to="interests" icon={ToggleRight}>
                Interests
              </ProfileLink>
              <ProfileLink to="invite" icon={UserPlus}>
                Invites
              </ProfileLink>
              <ProfileLink to="settings" icon={Settings}>
                Settings
              </ProfileLink>
              <ProfileLink to="feedback" icon={MessageCircle}>
                Feedback
              </ProfileLink>
            </View>
          </View>
        </View>
        <View className="py-10">
          <Button onPress={handleLogout} variant="link">
            Log out
          </Button>
          <Text className="text-center">v{VERSION}</Text>
          <Text className="text-center opacity-60">{UPDATE_ID}</Text>
        </View>
        {IS_DEV && (
          <Button className="mb-10" onPress={() => router.replace("/onboarding/1")} variant="outline">
            DEV: Trigger onboarding
          </Button>
        )}
      </ScrollView>
    </TabView>
  )
}

function ProfileLink({ children, to, icon }: { to: string; children: string; icon: RambleIcon }) {
  const router = useRouter()

  const path = `/(home)/(account)/account/${to}` as Href<AllRoutes>
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="mb-1 flex flex-row items-center justify-between rounded-xs border border-gray-200 px-4 py-3 dark:border-gray-700"
      onPress={() => router.push(path)}
    >
      <View className="flex flex-row items-center space-x-2">
        <Icon icon={icon} size={16} />
        <Text>{children}</Text>
      </View>
      <Icon icon={ChevronRight} color={{ light: "gray", dark: "white" }} />
    </TouchableOpacity>
  )
}
