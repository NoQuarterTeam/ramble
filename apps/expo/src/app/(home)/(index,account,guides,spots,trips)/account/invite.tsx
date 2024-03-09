import * as Clipboard from "expo-clipboard"
import { Copy, User2 } from "lucide-react-native"
import { ScrollView, TouchableOpacity, View } from "react-native"

import { createImageUrl } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
// import { useRouter } from "expo-router"

export default function AccountInviteScreen() {
  // const router = useRouter()
  const { data, isLoading } = api.inviteCode.myCodes.useQuery()
  const handleCopy = async (code: string) => {
    await Clipboard.setStringAsync(code)
    toast({ title: "Copied to clipboard!" })
  }

  return (
    <ScreenView title="invite codes">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {isLoading ? (
          <View className="flex items-center justify-center pt-4">
            <Spinner />
          </View>
        ) : !data || data?.length === 0 ? (
          <View className="flex items-center justify-center pt-4">
            <Text>No codes yet</Text>
          </View>
        ) : (
          data.map((inviteCode) => (
            <TouchableOpacity
              key={inviteCode.id}
              onPress={
                inviteCode.user
                  ? // eslint-disable-next-line
                    // () => router.push("UserScreen", { username: inviteCode.user!.username })
                    () => {
                      // TODO
                    }
                  : () => handleCopy(inviteCode.code)
              }
              activeOpacity={0.8}
              className="mb-1 flex flex-row items-center justify-between rounded-xs border border-gray-200 px-3 py-2 dark:border-gray-700"
            >
              <Text style={{ textDecorationLine: inviteCode.user ? "line-through" : undefined, textDecorationStyle: "solid" }}>
                {inviteCode.code}
              </Text>
              {inviteCode.user ? (
                inviteCode.user.avatar ? (
                  <OptimizedImage
                    width={40}
                    placeholder={inviteCode.user.avatarBlurHash}
                    height={40}
                    source={{ uri: createImageUrl(inviteCode.user.avatar) }}
                    className="sq-8 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
                  />
                ) : (
                  <View className="sq-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <Icon icon={User2} size={20} />
                  </View>
                )
              ) : (
                <View className="sq-8 flex items-center justify-center">
                  <Icon icon={Copy} size={20} />
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ScreenView>
  )
}
