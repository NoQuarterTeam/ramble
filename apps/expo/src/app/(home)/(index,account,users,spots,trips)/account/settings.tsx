import { languages, useDisclosure } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"
import { router } from "expo-router"
import { AlertCircle, ChevronDown, Languages, MapPinOff } from "lucide-react-native"
import { Alert, ScrollView, Switch, View } from "react-native"
import { Icon } from "~/components/Icon"
import { LanguageSelector } from "~/components/LanguageSelector"
import { Button } from "~/components/ui/Button"
import { ScreenView } from "~/components/ui/ScreenView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"

export default function AccountSettingsScreen() {
  const modalProps = useDisclosure()

  const utils = api.useUtils()

  const { me } = useMe()
  const { mutate: deleteAccount, isPending: isLoading } = api.user.deleteAccount.useMutation({
    onSuccess: async () => {
      modalProps.onClose()
      router.navigate("/")
      utils.user.me.setData(undefined, null)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({ title: "Account deleted." })
    },
  })
  const handleDeleteAccount = () => {
    Alert.alert("Are you sure?", "This can't be undone. We will delete all of your data associated with this account.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteAccount() },
    ])
  }

  const { mutate: updateUser } = api.user.update.useMutation({
    onMutate: (data) => {
      if (!me) return
      utils.user.me.setData(undefined, {
        ...me,
        preferredLanguage: data.preferredLanguage === undefined ? me.preferredLanguage : data.preferredLanguage,
        isLocationPrivate: data.isLocationPrivate === undefined ? me.isLocationPrivate : Boolean(data.isLocationPrivate),
        tripSyncEnabled: data.tripSyncEnabled === undefined ? me.tripSyncEnabled : Boolean(data.tripSyncEnabled),
        tripSyncOnNetworkEnabled:
          data.tripSyncOnNetworkEnabled === undefined ? me.tripSyncOnNetworkEnabled : Boolean(data.tripSyncOnNetworkEnabled),
      })
    },
  })

  if (!me) return null
  return (
    <ScreenView title="Settings">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <View className="flex-1 space-y-4">
          <View className="flex flex-row items-center justify-between space-x-2">
            <View className="flex flex-row items-center space-x-3">
              <Icon icon={Languages} size={30} />
              <View>
                <Text className="h-[22px] text-base">Preferred content language</Text>
                <Text style={{ lineHeight: 16 }} numberOfLines={3} className="max-w-[220px] text-sm opacity-75">
                  What language to show for the spot description, reviews, user bios, etc
                </Text>
              </View>
            </View>
            <Button
              onPress={modalProps.onOpen}
              variant="outline"
              size="xs"
              rightIcon={<Icon icon={ChevronDown} size={16} />}
              textClassName="pl-1 pr-2 text-left"
            >
              {languages.find((l) => l.code === me.preferredLanguage)?.code.toUpperCase() || "EN"}
            </Button>
            <LanguageSelector
              modalProps={modalProps}
              selectedLanguage={me.preferredLanguage}
              setSelectedLang={(lang) => updateUser({ preferredLanguage: lang })}
            />
          </View>
          <View className="flex flex-row items-center justify-between space-x-2">
            <View className="flex flex-row items-center space-x-3">
              <Icon icon={MapPinOff} size={30} />
              <View>
                <Text className="h-[22px] text-base">Hide location</Text>
                <Text style={{ lineHeight: 16 }} numberOfLines={3} className="max-w-[220px] text-sm opacity-75">
                  Hide your location on map. (It's only a rough estimate anyway)
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ true: colors.primary[600] }}
              value={me?.isLocationPrivate}
              onValueChange={() => updateUser({ isLocationPrivate: !me?.isLocationPrivate })}
            />
          </View>
          {/* <View className="flex flex-row items-center justify-between space-x-2">
            <View className="flex flex-row items-center space-x-3">
              <Icon icon={Image} size={30} />
              <View>
                <Text className="h-[22px] text-base">Trip media sync</Text>
                <Text style={{ lineHeight: 16 }} numberOfLines={3} className="max-w-[220px] text-sm opacity-75">
                  Enable automatic media sync for your current trip
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ true: colors.primary[600] }}
              value={me?.tripSyncEnabled}
              onValueChange={() => updateUser({ tripSyncEnabled: !me?.tripSyncEnabled })}
            />
          </View>
          <View className="flex flex-row items-center justify-between space-x-2">
            <View className="flex flex-row items-center space-x-3">
              <Icon icon={Wifi} size={30} />
              <View>
                <Text className="h-[22px] text-base">Trip sync on network</Text>
                <Text style={{ lineHeight: 16 }} numberOfLines={3} className="max-w-[220px] text-sm opacity-75">
                  Enable trip media sync when not connected to wifi
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ true: colors.primary[600] }}
              value={me?.tripSyncOnNetworkEnabled}
              onValueChange={() => updateUser({ tripSyncOnNetworkEnabled: !me?.tripSyncOnNetworkEnabled })}
            />
          </View> */}
        </View>

        <View className="pb-8">
          <Button
            isLoading={isLoading}
            leftIcon={<Icon icon={AlertCircle} size={16} />}
            variant="ghost"
            onPress={handleDeleteAccount}
          >
            Delete account
          </Button>
        </View>
      </ScrollView>
    </ScreenView>
  )
}
