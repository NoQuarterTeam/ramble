import { Copy, User2 } from "lucide-react-native"
import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"

import { Icon } from "../../../components/Icon"
import { ScreenView } from "../../../components/ui/ScreenView"
import { Spinner } from "../../../components/ui/Spinner"
import { Text } from "../../../components/ui/Text"
import { api } from "../../../lib/api"
import { createImageUrl, join } from "@ramble/shared"
import { OptimizedImage } from "../../../components/ui/OptimisedImage"
import { useRouter } from "../../router"

export function AccountInviteScreen() {
  const router = useRouter()
  const { data, isLoading } = api.inviteCode.myCodes.useQuery()
  const handleCopy = (code: string) => {}

  return (
    <ScreenView title="invite codes">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="flex items-center justify-center pt-16">
            <Spinner />
          </View>
        ) : !data || data?.length === 0 ? (
          <View className="flex items-center justify-center pt-16">
            <Text>No codes yet</Text>
          </View>
        ) : (
          data.map((inviteCode) => (
            <TouchableOpacity
              key={inviteCode.id}
              // disabled={!!inviteCode.user}
              onPress={
                !!inviteCode.user
                  ? () => router.push("UserScreen", { username: inviteCode.user!.username })
                  : () => handleCopy(inviteCode.code)
              }
              activeOpacity={0.8}
              className="rounded-xs mb-1 flex flex-row items-center justify-between border border-gray-200 px-3 py-2 dark:border-gray-700"
            >
              <Text style={{ textDecorationLine: !!inviteCode.user ? "line-through" : undefined, textDecorationStyle: "solid" }}>
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
                <View className="sq-8 flex items-center justify-center ">
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
