import { Modal, ScrollView, Switch, View } from "react-native"
import { ChevronDown, Languages, MapPin } from "lucide-react-native"

import { languages, useDisclosure } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "../../../components/Icon"
import { LanguageSelector } from "../../../components/LanguageSelector"
import { Button } from "../../../components/ui/Button"
import { ModalView } from "../../../components/ui/ModalView"
import { ScreenView } from "../../../components/ui/ScreenView"
import { Text } from "../../../components/ui/Text"
import { toast } from "../../../components/ui/Toast"
import { api } from "../../../lib/api"
import { useMe } from "../../../lib/hooks/useMe"
import { useRouter } from "../../router"

export function AccountSettingsScreen() {
  const modalProps = useDisclosure()
  const router = useRouter()
  const utils = api.useUtils()

  const { me } = useMe()
  const { mutate: deleteAccount, isLoading } = api.user.deleteAccount.useMutation({
    onSuccess: async () => {
      modalProps.onClose()
      router.popToTop()
      utils.user.me.setData(undefined, null)
      toast({ title: "Account deleted." })
    },
  })
  const { mutate: updateUser } = api.user.update.useMutation({
    onMutate: (data) => {
      if (!me) return
      utils.user.me.setData(undefined, {
        ...me,
        preferredLanguage: data.preferredLanguage === undefined ? me.preferredLanguage : data.preferredLanguage,
        isLocationPrivate: data.isLocationPrivate === undefined ? me.isLocationPrivate : Boolean(data.isLocationPrivate),
      })
    },
  })

  if (!me) return null
  return (
    <ScreenView title="Settings">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="space-y-4">
          <View className="flex flex-row items-center justify-between space-x-2">
            <View className="flex flex-row items-center space-x-3">
              <Icon icon={Languages} size={30} />
              <View>
                <Text className="h-[22px] text-base">Spot description language</Text>
                <Text style={{ lineHeight: 16 }} numberOfLines={3} className="max-w-[220px] text-sm opacity-75">
                  Control what language to show for the spot description
                </Text>
              </View>
            </View>
            <Button onPress={modalProps.onOpen} variant="outline" size="xs" rightIcon={<Icon icon={ChevronDown} size={16} />}>
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
              <Icon icon={MapPin} size={30} />
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
          <View className="pt-4">
            <Button variant="ghost" onPress={modalProps.onOpen}>
              Delete account
            </Button>
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        presentationStyle="formSheet"
        visible={modalProps.isOpen}
        onRequestClose={modalProps.onClose}
        onDismiss={modalProps.onClose}
      >
        <ModalView title="are you sure?" onBack={modalProps.onClose}>
          <View className="space-y-2 pt-4">
            <Text>This can't be undone!</Text>
            <Button isLoading={isLoading} onPress={() => deleteAccount()} variant="destructive">
              Confirm
            </Button>
          </View>
        </ModalView>
      </Modal>
    </ScreenView>
  )
}
